package com.rycapp.interfaces.rest.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record AuthResendOtpRequest(
        @NotBlank(message = "El correo es obligatorio.")
        @Email(message = "Correo no válido.")
        String correo
) {}
