package com.rycapp.interfaces.rest.controller;

import com.rycapp.application.service.AuthService;
import com.rycapp.infrastructure.security.JwtPrincipal;
import com.rycapp.interfaces.rest.dto.auth.*;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final long jwtExpirationMinutes;

    public AuthController(
            AuthService authService,
            @Value("${app.jwt.expiration-minutes}") long jwtExpirationMinutes
    ) {
        this.authService = authService;
        this.jwtExpirationMinutes = jwtExpirationMinutes;
    }

    @PostMapping("/registro")
    public ResponseEntity<MessageResponse> registro(@Valid @RequestBody AuthRegisterRequest req) {
        authService.registrar(req.correo(), req.password(), req.cedula(), req.nombre(), req.apellido());
        return ResponseEntity.ok(new MessageResponse(
                "Registro creado. Revisa tu correo: el código OTP es válido por 2 minutos."
        ));
    }

    @PostMapping("/verificar-correo")
    public ResponseEntity<MessageResponse> verificar(@Valid @RequestBody AuthVerifyEmailRequest req) {
        authService.verificarCorreo(req.correo(), req.codigo());
        return ResponseEntity.ok(new MessageResponse("Correo verificado. Ya puedes iniciar sesión."));
    }

    @PostMapping("/reenviar-otp")
    public ResponseEntity<MessageResponse> reenviar(@Valid @RequestBody AuthResendOtpRequest req) {
        authService.reenviarOtp(req.correo());
        return ResponseEntity.ok(new MessageResponse(
                "Si el correo existe y no está verificado, se ha enviado un nuevo código."
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthLoginResponse> login(@Valid @RequestBody AuthLoginRequest req) {
        var result = authService.login(req.correo(), req.password());
        var usuario = new AuthUserSummary(
                result.usuarioId(),
                result.correo(),
                result.nombre(),
                result.apellido(),
                result.rolDescripcion()
        );
        return ResponseEntity.ok(new AuthLoginResponse(
                result.accessToken(),
                "Bearer",
                jwtExpirationMinutes,
                usuario
        ));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthUserSummary> me(@AuthenticationPrincipal Object principal) {
        if (!(principal instanceof JwtPrincipal p)) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(new AuthUserSummary(
                p.usuarioId(),
                p.email(),
                p.nombre(),
                p.apellido(),
                p.rolDescripcion()
        ));
    }
}
