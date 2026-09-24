package com.rycapp.interfaces.rest.dto.usuario;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UsuarioUpdateRequest(
        @NotNull(message = "rolId es obligatorio.")
        String rolId,

        @NotBlank(message = "La cédula es obligatoria.")
        @Size(max = 20, message = "La cédula no debe exceder 20 caracteres.")
        String cedula,

        @NotBlank(message = "El nombre es obligatorio.")
        @Size(max = 80, message = "El nombre no debe exceder 80 caracteres.")
        String nombre,

        @NotBlank(message = "El apellido es obligatorio.")
        @Size(max = 80, message = "El apellido no debe exceder 80 caracteres.")
        String apellido,

        @NotBlank(message = "El estado es obligatorio.")
        @Size(max = 32, message = "El estado no debe exceder 32 caracteres.")
        String estado
) {}
