package com.rycapp.application.service;

import com.rycapp.application.exception.ConflictException;
import com.rycapp.application.exception.AccountPendingApprovalException;
import com.rycapp.application.exception.EmailNotVerifiedException;
import com.rycapp.application.exception.InvalidCredentialsException;
import com.rycapp.application.exception.InvalidOtpException;
import com.rycapp.infrastructure.mail.MailAccountNotifications;
import com.rycapp.infrastructure.mail.MailOtpSender;
import com.rycapp.infrastructure.persistence.jpa.entity.CuentaAutenticacionEntity;
import com.rycapp.infrastructure.persistence.jpa.entity.UsuarioEntity;
import com.rycapp.infrastructure.persistence.jpa.repository.CuentaAutenticacionJpaRepository;
import com.rycapp.infrastructure.persistence.jpa.repository.RolJpaRepository;
import com.rycapp.infrastructure.persistence.jpa.repository.UsuarioJpaRepository;
import com.rycapp.infrastructure.security.JwtService;
import com.rycapp.infrastructure.security.OtpGenerator;
import com.rycapp.infrastructure.security.OtpHasher;
import com.rycapp.infrastructure.security.PasswordPolicy;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDateTime;
@Service
public class AuthService {
    private static final String ROL_REGISTRADO = "Usuario registrado";
    private static final String ESTADO_PENDIENTE_APROBACION = "PENDIENTE_APROBACION";
    private static final String ESTADO_ACTIVO = "ACTIVO";

    private final UsuarioJpaRepository usuarioJpaRepository;
    private final RolJpaRepository rolJpaRepository;
    private final CuentaAutenticacionJpaRepository cuentaJpaRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpGenerator otpGenerator;
    private final JwtService jwtService;
    private final MailOtpSender mailOtpSender;
    private final MailAccountNotifications mailAccountNotifications;
    private final int otpLength;
    private final int otpExpirationMinutes;
    private final Clock clock;

    public AuthService(
            UsuarioJpaRepository usuarioJpaRepository,
            RolJpaRepository rolJpaRepository,
            CuentaAutenticacionJpaRepository cuentaJpaRepository,
            PasswordEncoder passwordEncoder,
            OtpGenerator otpGenerator,
            JwtService jwtService,
            MailOtpSender mailOtpSender,
            MailAccountNotifications mailAccountNotifications,
            @Value("${app.auth.otp-length:6}") int otpLength,
            @Value("${app.auth.otp-expiration-minutes:2}") int otpExpirationMinutes
    ) {
        this.usuarioJpaRepository = usuarioJpaRepository;
        this.rolJpaRepository = rolJpaRepository;
        this.cuentaJpaRepository = cuentaJpaRepository;
        this.passwordEncoder = passwordEncoder;
        this.otpGenerator = otpGenerator;
        this.jwtService = jwtService;
        this.mailOtpSender = mailOtpSender;
        this.mailAccountNotifications = mailAccountNotifications;
        this.otpLength = otpLength;
        this.otpExpirationMinutes = otpExpirationMinutes;
        this.clock = Clock.systemUTC();
    }

    @Transactional
    public void registrar(String correo, String passwordPlano, String cedula, String nombre, String apellido) {
        PasswordPolicy.requireStrong(passwordPlano);
        String email = correo.trim().toLowerCase();
        if (cuentaJpaRepository.existsByCorreoIgnoreCase(email)) {
            throw new ConflictException("Ya existe una cuenta con ese correo.");
        }
        if (usuarioJpaRepository.existsByCedulaIgnoreCase(cedula.trim())) {
            throw new ConflictException("Ya existe un usuario con esa cédula.");
        }
        var rol = rolJpaRepository.findByDescripcion(ROL_REGISTRADO)
                .orElseThrow(() -> new IllegalStateException("Rol '" + ROL_REGISTRADO + "' no existe. Ejecute migraciones Flyway."));

        var usuario = new UsuarioEntity();
        usuario.setRol(rol);
        usuario.setCedula(cedula.trim());
        usuario.setNombre(nombre.trim());
        usuario.setApellido(apellido.trim());
        usuario.setEstado(ESTADO_PENDIENTE_APROBACION);
        usuario = usuarioJpaRepository.save(usuario);

        var cuenta = new CuentaAutenticacionEntity();
        cuenta.setUsuario(usuario);
        cuenta.setCorreo(email);
        cuenta.setContrasenaHash(passwordEncoder.encode(passwordPlano));
        cuenta.setCorreoVerificado(false);
        generarYEnviarOtp(cuenta);
        cuentaJpaRepository.save(cuenta);
    }

    @Transactional
    public void verificarCorreo(String correo, String codigoOtp) {
        String email = correo.trim().toLowerCase();
        var cuenta = cuentaJpaRepository.findWithUsuarioByCorreoIgnoreCase(email)
                .orElseThrow(() -> new InvalidOtpException("Cuenta no encontrada."));
        if (cuenta.isCorreoVerificado()) {
            throw new ConflictException("Este correo ya fue verificado.");
        }
        if (cuenta.getOtpHash() == null || cuenta.getOtpExpira() == null) {
            throw new InvalidOtpException("No hay un código activo. Solicita reenvío.");
        }
        LocalDateTime ahora = LocalDateTime.now(clock);
        if (ahora.isAfter(cuenta.getOtpExpira())) {
            throw new InvalidOtpException("El código expiró. Solicita uno nuevo.");
        }
        if (!OtpHasher.matches(cuenta.getOtpHash(), codigoOtp)) {
            throw new InvalidOtpException("Código incorrecto.");
        }
        cuenta.setCorreoVerificado(true);
        cuenta.setOtpHash(null);
        cuenta.setOtpExpira(null);
        cuentaJpaRepository.save(cuenta);

        UsuarioEntity u = cuenta.getUsuario();
        mailAccountNotifications.notificarAdminsCuentaEsperandoAprobacion(
                u.getNombre(),
                u.getApellido(),
                cuenta.getCorreo(),
                u.getCedula()
        );
    }

    @Transactional
    public void reenviarOtp(String correo) {
        String email = correo.trim().toLowerCase();
        var cuenta = cuentaJpaRepository.findWithUsuarioByCorreoIgnoreCase(email).orElse(null);
        if (cuenta == null) {
            return;
        }
        if (cuenta.isCorreoVerificado()) {
            throw new ConflictException("Este correo ya está verificado.");
        }
        generarYEnviarOtp(cuenta);
        cuentaJpaRepository.save(cuenta);
    }

    @Transactional(readOnly = true)
    public LoginResult login(String correo, String passwordPlano) {
        String email = correo.trim().toLowerCase();
        var cuenta = cuentaJpaRepository.findWithUsuarioByCorreoIgnoreCase(email)
                .orElseThrow(InvalidCredentialsException::new);
        if (!passwordEncoder.matches(passwordPlano, cuenta.getContrasenaHash())) {
            throw new InvalidCredentialsException();
        }
        if (!cuenta.isCorreoVerificado()) {
            throw new EmailNotVerifiedException();
        }
        UsuarioEntity u = cuenta.getUsuario();
        if (!ESTADO_ACTIVO.equalsIgnoreCase(u.getEstado())) {
            throw new AccountPendingApprovalException();
        }
        String rolDesc = u.getRol() != null ? u.getRol().getDescripcion() : "";
        String token = jwtService.createAccessToken(
                u.getId(),
                cuenta.getCorreo(),
                u.getNombre(),
                u.getApellido(),
                rolDesc
        );
        return new LoginResult(token, u.getId(), cuenta.getCorreo(), u.getNombre(), u.getApellido(), rolDesc);
    }

    private void generarYEnviarOtp(CuentaAutenticacionEntity cuenta) {
        String plain = otpGenerator.generateNumericOtp(otpLength);
        cuenta.setOtpHash(OtpHasher.sha256Hex(plain));
        cuenta.setOtpExpira(LocalDateTime.now(clock).plusMinutes(otpExpirationMinutes));
        mailOtpSender.sendOtp(cuenta.getCorreo(), plain, otpExpirationMinutes);
    }

    /**
     * No revela si el correo existe: solo envía OTP si hay cuenta con correo verificado.
     */
    @Transactional
    public void solicitarRecuperacionContrasena(String correo) {
        String email = correo.trim().toLowerCase();
        var opt = cuentaJpaRepository.findWithUsuarioByCorreoIgnoreCase(email);
        if (opt.isEmpty() || !opt.get().isCorreoVerificado()) {
            return;
        }
        var cuenta = opt.get();
        generarYEnviarOtpRecuperacion(cuenta);
        cuentaJpaRepository.save(cuenta);
    }

    @Transactional
    public void confirmarRecuperacionContrasena(String correo, String codigoOtp, String nuevaPasswordPlano) {
        PasswordPolicy.requireStrong(nuevaPasswordPlano);
        String email = correo.trim().toLowerCase();
        var cuenta = cuentaJpaRepository.findWithUsuarioByCorreoIgnoreCase(email)
                .orElseThrow(() -> new InvalidOtpException("Cuenta no encontrada o código no válido."));
        if (!cuenta.isCorreoVerificado()) {
            throw new InvalidOtpException("Cuenta no encontrada o código no válido.");
        }
        if (cuenta.getResetOtpHash() == null || cuenta.getResetOtpExpira() == null) {
            throw new InvalidOtpException("No hay un código activo. Solicita uno nuevo desde «Olvidé mi contraseña».");
        }
        LocalDateTime ahora = LocalDateTime.now(clock);
        if (ahora.isAfter(cuenta.getResetOtpExpira())) {
            throw new InvalidOtpException("El código expiró. Solicita uno nuevo.");
        }
        if (!OtpHasher.matches(cuenta.getResetOtpHash(), codigoOtp)) {
            throw new InvalidOtpException("Código incorrecto.");
        }
        cuenta.setContrasenaHash(passwordEncoder.encode(nuevaPasswordPlano));
        cuenta.setResetOtpHash(null);
        cuenta.setResetOtpExpira(null);
        cuentaJpaRepository.save(cuenta);
    }

    private void generarYEnviarOtpRecuperacion(CuentaAutenticacionEntity cuenta) {
        String plain = otpGenerator.generateNumericOtp(otpLength);
        cuenta.setResetOtpHash(OtpHasher.sha256Hex(plain));
        cuenta.setResetOtpExpira(LocalDateTime.now(clock).plusMinutes(otpExpirationMinutes));
        mailOtpSender.sendPasswordResetOtp(cuenta.getCorreo(), plain, otpExpirationMinutes);
    }
}
