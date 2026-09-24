package com.rycapp.domain.model;

import java.time.Instant;

public record CuentaAutenticacion(
        String usuarioId,
        String correo,
        String contrasenaHash,
        boolean correoVerificado,
        String otpHash,
        Instant otpExpira,
        String resetOtpHash,
        Instant resetOtpExpira
) {}
