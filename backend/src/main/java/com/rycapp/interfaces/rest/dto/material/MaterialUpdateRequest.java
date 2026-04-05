package com.rycapp.interfaces.rest.dto.material;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record MaterialUpdateRequest(
        @NotBlank(message = "Material es obligatorio.")
        @Size(max = 120, message = "Material no debe exceder 120 caracteres.")
        String material,

        @Size(max = 500, message = "Descripcion no debe exceder 500 caracteres.")
        String descripcion
) {}
