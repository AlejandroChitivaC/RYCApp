package com.rycapp.interfaces.rest.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AuthVerifyEmailRequest(
        @NotBlank(message = "El correo es obligatorio.")
        @Email(message = "Correo no válido.")
        String correo,

        @NotBlank(message = "El código OTP es obligatorio.")
        @Size(min = 4, max = 12, message = "Código OTP no válido.")
        String codigo
) {}
