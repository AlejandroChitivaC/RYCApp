package com.rycapp.interfaces.rest.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AuthRegisterRequest(
        @NotBlank(message = "El correo es obligatorio.")
        @Email(message = "Correo no válido.")
        @Size(max = 120, message = "El correo no debe exceder 120 caracteres.")
        String correo,

        @NotBlank(message = "La contraseña es obligatoria.")
        @Size(min = 8, max = 72, message = "La contraseña debe tener entre 8 y 72 caracteres, al menos un número y un carácter especial.")
        String password,

        @NotBlank(message = "La cédula es obligatoria.")
        @Size(max = 20, message = "La cédula no debe exceder 20 caracteres.")
        String cedula,

        @NotBlank(message = "El nombre es obligatorio.")
        @Size(max = 80, message = "El nombre no debe exceder 80 caracteres.")
        String nombre,

        @NotBlank(message = "El apellido es obligatorio.")
        @Size(max = 80, message = "El apellido no debe exceder 80 caracteres.")
        String apellido
) {}
