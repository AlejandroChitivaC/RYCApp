package com.rycapp.application.service;

import com.rycapp.application.exception.AccountPendingApprovalException;
import com.rycapp.application.exception.ConflictException;
import com.rycapp.application.exception.EmailNotVerifiedException;
import com.rycapp.application.exception.InvalidCredentialsException;
import com.rycapp.application.exception.InvalidOtpException;
import com.rycapp.application.ports.out.CuentaAutenticacionRepository;
import com.rycapp.application.ports.out.RolRepository;
import com.rycapp.application.ports.out.UsuarioRepository;
import com.rycapp.domain.model.CuentaAutenticacion;
import com.rycapp.domain.model.Usuario;
import com.rycapp.infrastructure.mail.MailAccountNotifications;
import com.rycapp.infrastructure.mail.MailOtpSender;
import com.rycapp.infrastructure.security.JwtService;
import com.rycapp.infrastructure.security.OtpGenerator;
import com.rycapp.infrastructure.security.OtpHasher;
import com.rycapp.infrastructure.security.PasswordPolicy;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.Instant;

@Service
public class AuthService {
    private static final String ROL_REGISTRADO = "Usuario registrado";
    private static final String ESTADO_PENDIENTE_APROBACION = "PENDIENTE_APROBACION";
    private static final String ESTADO_ACTIVO = "ACTIVO";

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final CuentaAutenticacionRepository cuentaRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpGenerator otpGenerator;
    private final JwtService jwtService;
    private final MailOtpSender mailOtpSender;
    private final MailAccountNotifications mailAccountNotifications;
    private final int otpLength;
    private final int otpExpirationMinutes;
    private final Clock clock;

    public AuthService(
            UsuarioRepository usuarioRepository,
            RolRepository rolRepository,
            CuentaAutenticacionRepository cuentaRepository,
            PasswordEncoder passwordEncoder,
            OtpGenerator otpGenerator,
            JwtService jwtService,
            MailOtpSender mailOtpSender,
            MailAccountNotifications mailAccountNotifications,
            @Value("${app.auth.otp-length:6}") int otpLength,
            @Value("${app.auth.otp-expiration-minutes:2}") int otpExpirationMinutes
    ) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.cuentaRepository = cuentaRepository;
        this.passwordEncoder = passwordEncoder;
        this.otpGenerator = otpGenerator;
        this.jwtService = jwtService;
        this.mailOtpSender = mailOtpSender;
        this.mailAccountNotifications = mailAccountNotifications;
        this.otpLength = otpLength;
        this.otpExpirationMinutes = otpExpirationMinutes;
        this.clock = Clock.systemUTC();
    }

    public void registrar(String correo, String passwordPlano, String cedula, String nombre, String apellido) {
        PasswordPolicy.requireStrong(passwordPlano);
        String email = correo.trim().toLowerCase();
        if (cuentaRepository.existsByCorreoIgnoreCase(email)) {
            throw new ConflictException("Ya existe una cuenta con ese correo.");
        }
        if (usuarioRepository.existsByCedulaIgnoreCase(cedula.trim())) {
            throw new ConflictException("Ya existe un usuario con esa cédula.");
        }
        var rol = rolRepository.findByDescripcion(ROL_REGISTRADO)
                .orElseThrow(() -> new IllegalStateException("Falta el rol '" + ROL_REGISTRADO + "'."));

        var usuario = usuarioRepository.save(new Usuario(
                null, rol.id(), cedula.trim(), nombre.trim(), apellido.trim(), ESTADO_PENDIENTE_APROBACION
        ));

        var otp = generarOtp();
        cuentaRepository.save(new CuentaAutenticacion(
                usuario.id(),
                email,
                passwordEncoder.encode(passwordPlano),
                false,
                otp.hash(),
                otp.expira(),
                null,
                null
        ));
        mailOtpSender.sendOtp(email, otp.plain(), otpExpirationMinutes);
    }

    public void verificarCorreo(String correo, String codigoOtp) {
        String email = correo.trim().toLowerCase();
        var cuenta = cuentaRepository.findByCorreoIgnoreCase(email)
                .orElseThrow(() -> new InvalidOtpException("Cuenta no encontrada."));
        if (cuenta.correoVerificado()) {
            throw new ConflictException("Este correo ya fue verificado.");
        }
        validarOtp(cuenta.otpHash(), cuenta.otpExpira(), codigoOtp);
        cuentaRepository.save(new CuentaAutenticacion(
                cuenta.usuarioId(), cuenta.correo(), cuenta.contrasenaHash(),
                true, null, null, cuenta.resetOtpHash(), cuenta.resetOtpExpira()
        ));

        usuarioRepository.findById(cuenta.usuarioId()).ifPresent(u ->
                mailAccountNotifications.notificarAdminsCuentaEsperandoAprobacion(
                        u.nombre(), u.apellido(), cuenta.correo(), u.cedula()
                )
        );
    }

    public void reenviarOtp(String correo) {
        String email = correo.trim().toLowerCase();
        var opt = cuentaRepository.findByCorreoIgnoreCase(email);
        if (opt.isEmpty()) {
            return;
        }
        var cuenta = opt.get();
        if (cuenta.correoVerificado()) {
            throw new ConflictException("Este correo ya está verificado.");
        }
        var otp = generarOtp();
        cuentaRepository.save(new CuentaAutenticacion(
                cuenta.usuarioId(), cuenta.correo(), cuenta.contrasenaHash(),
                false, otp.hash(), otp.expira(), cuenta.resetOtpHash(), cuenta.resetOtpExpira()
        ));
        mailOtpSender.sendOtp(email, otp.plain(), otpExpirationMinutes);
    }

    public LoginResult login(String correo, String passwordPlano) {
        String email = correo.trim().toLowerCase();
        var cuenta = cuentaRepository.findByCorreoIgnoreCase(email)
                .orElseThrow(InvalidCredentialsException::new);
        if (!passwordEncoder.matches(passwordPlano, cuenta.contrasenaHash())) {
            throw new InvalidCredentialsException();
        }
        if (!cuenta.correoVerificado()) {
            throw new EmailNotVerifiedException();
        }
        var usuario = usuarioRepository.findById(cuenta.usuarioId())
                .orElseThrow(InvalidCredentialsException::new);
        if (!ESTADO_ACTIVO.equalsIgnoreCase(usuario.estado())) {
            throw new AccountPendingApprovalException();
        }
        String rolDesc = rolRepository.findById(usuario.rolId())
                .map(r -> r.descripcion())
                .orElse("");
        String token = jwtService.createAccessToken(
                usuario.id(), cuenta.correo(), usuario.nombre(), usuario.apellido(), rolDesc
        );
        return new LoginResult(token, usuario.id(), cuenta.correo(), usuario.nombre(), usuario.apellido(), rolDesc);
    }

    public void solicitarRecuperacionContrasena(String correo) {
        String email = correo.trim().toLowerCase();
        var opt = cuentaRepository.findByCorreoIgnoreCase(email);
        if (opt.isEmpty() || !opt.get().correoVerificado()) {
            return;
        }
        var cuenta = opt.get();
        var otp = generarOtp();
        cuentaRepository.save(new CuentaAutenticacion(
                cuenta.usuarioId(), cuenta.correo(), cuenta.contrasenaHash(),
                true, cuenta.otpHash(), cuenta.otpExpira(), otp.hash(), otp.expira()
        ));
        mailOtpSender.sendPasswordResetOtp(email, otp.plain(), otpExpirationMinutes);
    }

    public void confirmarRecuperacionContrasena(String correo, String codigoOtp, String nuevaPasswordPlano) {
        PasswordPolicy.requireStrong(nuevaPasswordPlano);
        String email = correo.trim().toLowerCase();
        var cuenta = cuentaRepository.findByCorreoIgnoreCase(email)
                .orElseThrow(() -> new InvalidOtpException("Cuenta no encontrada o código no válido."));
        if (!cuenta.correoVerificado()) {
            throw new InvalidOtpException("Cuenta no encontrada o código no válido.");
        }
        validarOtp(cuenta.resetOtpHash(), cuenta.resetOtpExpira(), codigoOtp);
        cuentaRepository.save(new CuentaAutenticacion(
                cuenta.usuarioId(),
                cuenta.correo(),
                passwordEncoder.encode(nuevaPasswordPlano),
                true,
                cuenta.otpHash(),
                cuenta.otpExpira(),
                null,
                null
        ));
    }

    private void validarOtp(String hash, Instant expira, String codigo) {
        if (hash == null || expira == null) {
            throw new InvalidOtpException("No hay un código activo. Solicita uno nuevo.");
        }
        if (Instant.now(clock).isAfter(expira)) {
            throw new InvalidOtpException("El código expiró. Solicita uno nuevo.");
        }
        if (!OtpHasher.matches(hash, codigo)) {
            throw new InvalidOtpException("Código incorrecto.");
        }
    }

    private OtpPair generarOtp() {
        String plain = otpGenerator.generateNumericOtp(otpLength);
        return new OtpPair(
                plain,
                OtpHasher.sha256Hex(plain),
                Instant.now(clock).plusSeconds(otpExpirationMinutes * 60L)
        );
    }

    private record OtpPair(String plain, String hash, Instant expira) {}
}
