package com.rycapp.infrastructure.bootstrap;

import com.rycapp.application.ports.out.CuentaAutenticacionRepository;
import com.rycapp.application.ports.out.RolRepository;
import com.rycapp.application.ports.out.UsuarioRepository;
import com.rycapp.domain.model.CuentaAutenticacion;
import com.rycapp.domain.model.Rol;
import com.rycapp.domain.model.Usuario;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Order(100)
@ConditionalOnProperty(prefix = "app.bootstrap.admin", name = "enabled", havingValue = "true")
public class DevAdminAccountBootstrap implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(DevAdminAccountBootstrap.class);
    private static final List<String> ROLES_BASE = List.of(
            "Administrador", "Usuario registrado", "Conductor", "Contador"
    );
    private static final String CEDULA_SEED = "0000000000";

    private final RolRepository rolRepository;
    private final UsuarioRepository usuarioRepository;
    private final CuentaAutenticacionRepository cuentaRepository;
    private final PasswordEncoder passwordEncoder;
    private final String email;
    private final String password;

    public DevAdminAccountBootstrap(
            RolRepository rolRepository,
            UsuarioRepository usuarioRepository,
            CuentaAutenticacionRepository cuentaRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.bootstrap.admin.email}") String email,
            @Value("${app.bootstrap.admin.password}") String password
    ) {
        this.rolRepository = rolRepository;
        this.usuarioRepository = usuarioRepository;
        this.cuentaRepository = cuentaRepository;
        this.passwordEncoder = passwordEncoder;
        this.email = email;
        this.password = password;
    }

    @Override
    public void run(ApplicationArguments args) {
        for (String nombre : ROLES_BASE) {
            if (rolRepository.findByDescripcion(nombre).isEmpty()) {
                rolRepository.save(new Rol(null, nombre));
            }
        }

        if (password == null || password.isBlank()) {
            log.warn("Bootstrap admin omitido: app.bootstrap.admin.password está vacío.");
            return;
        }
        if (!usuarioRepository.findCorreosAdministradores().isEmpty()) {
            log.info("Ya hay un administrador con cuenta. Bootstrap omitido.");
            return;
        }
        if (cuentaRepository.existsByCorreoIgnoreCase(email.trim())) {
            log.warn("El correo {} ya está en uso. Bootstrap omitido.", email);
            return;
        }

        var rolAdmin = rolRepository.findByDescripcion("Administrador")
                .orElseThrow(() -> new IllegalStateException("No se pudo crear el rol Administrador."));

        var usuario = usuarioRepository.save(new Usuario(
                null, rolAdmin.id(), CEDULA_SEED, "Sistema", "Inicial", "ACTIVO"
        ));
        cuentaRepository.save(new CuentaAutenticacion(
                usuario.id(),
                email.trim().toLowerCase(),
                passwordEncoder.encode(password),
                true,
                null,
                null,
                null,
                null
        ));
        log.info("Cuenta Administrador lista. Correo={}", email.trim().toLowerCase());
    }
}
