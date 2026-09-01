package com.rycapp.infrastructure.bootstrap;

import com.rycapp.infrastructure.persistence.jpa.entity.CuentaAutenticacionEntity;
import com.rycapp.infrastructure.persistence.jpa.entity.UsuarioEntity;
import com.rycapp.infrastructure.persistence.jpa.repository.CuentaAutenticacionJpaRepository;
import com.rycapp.infrastructure.persistence.jpa.repository.RolJpaRepository;
import com.rycapp.infrastructure.persistence.jpa.repository.UsuarioJpaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;

/**
 * Crea la primera cuenta Administrador si no existe ninguna con login.
 * El seed de V1 ({@code Usuario} Sistema/Inicial) no incluye {@code Cuenta_Autenticacion},
 * así que sin esto no hay forma de entrar al panel.
 *
 * Desactivar en producción: {@code APP_BOOTSTRAP_ADMIN_ENABLED=false}.
 */
@Component
@Order(100)
@ConditionalOnProperty(prefix = "app.bootstrap.admin", name = "enabled", havingValue = "true")
public class DevAdminAccountBootstrap implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(DevAdminAccountBootstrap.class);
    private static final String ROL_ADMIN = "Administrador";
    private static final String ESTADO_ACTIVO = "ACTIVO";
    private static final String CEDULA_SEED = "0000000000";

    private final UsuarioJpaRepository usuarioJpaRepository;
    private final RolJpaRepository rolJpaRepository;
    private final CuentaAutenticacionJpaRepository cuentaJpaRepository;
    private final PasswordEncoder passwordEncoder;
    private final String email;
    private final String password;

    public DevAdminAccountBootstrap(
            UsuarioJpaRepository usuarioJpaRepository,
            RolJpaRepository rolJpaRepository,
            CuentaAutenticacionJpaRepository cuentaJpaRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.bootstrap.admin.email}") String email,
            @Value("${app.bootstrap.admin.password}") String password
    ) {
        this.usuarioJpaRepository = usuarioJpaRepository;
        this.rolJpaRepository = rolJpaRepository;
        this.cuentaJpaRepository = cuentaJpaRepository;
        this.passwordEncoder = passwordEncoder;
        this.email = email;
        this.password = password;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!cuentaJpaRepository.findCorreosAdministradores().isEmpty()) {
            log.info("Ya existe al menos un Administrador con cuenta. Bootstrap omitido.");
            return;
        }
        if (cuentaJpaRepository.existsByCorreoIgnoreCase(email.trim())) {
            log.warn("El correo {} ya está en uso y no es Administrador. Bootstrap omitido.", email);
            return;
        }

        var rol = rolJpaRepository.findByDescripcion(ROL_ADMIN)
                .orElseThrow(() -> new IllegalStateException("Rol Administrador no existe. Revisa migraciones Flyway."));

        UsuarioEntity usuario = usuarioJpaRepository.findByCedulaIgnoreCase(CEDULA_SEED).orElse(null);
        if (usuario == null) {
            usuario = new UsuarioEntity();
            usuario.setCedula(CEDULA_SEED);
            usuario.setNombre("Sistema");
            usuario.setApellido("Inicial");
        }
        usuario.setRol(rol);
        usuario.setEstado(ESTADO_ACTIVO);
        usuario = usuarioJpaRepository.save(usuario);

        if (cuentaJpaRepository.findByUsuario_Id(usuario.getId()).isPresent()) {
            log.warn("El usuario seed ya tiene cuenta de login. Bootstrap omitido.");
            return;
        }

        var cuenta = new CuentaAutenticacionEntity();
        cuenta.setUsuario(usuario);
        cuenta.setCorreo(email.trim().toLowerCase());
        cuenta.setContrasenaHash(passwordEncoder.encode(password));
        cuenta.setCorreoVerificado(true);
        cuentaJpaRepository.save(cuenta);

        log.info(
                "Cuenta Administrador lista para login local. Correo={} (contraseña: app.bootstrap.admin.password)",
                email.trim().toLowerCase()
        );
    }
}
