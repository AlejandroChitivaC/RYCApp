package com.rycapp.interfaces.rest.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AuthRecuperacionConfirmarRequest(
        @NotBlank(message = "El correo es obligatorio.")
        @Email(message = "Correo no válido.")
        @Size(max = 120, message = "El correo no debe exceder 120 caracteres.")
        String correo,

        @NotBlank(message = "El código OTP es obligatorio.")
        @Size(min = 4, max = 12, message = "Código no válido.")
        String codigo,

        @NotBlank(message = "La nueva contraseña es obligatoria.")
        @Size(min = 8, max = 72, message = "La contraseña debe tener entre 8 y 72 caracteres.")
        String password
) {}
