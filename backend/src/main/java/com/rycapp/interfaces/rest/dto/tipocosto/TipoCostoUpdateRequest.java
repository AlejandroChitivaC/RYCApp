package com.rycapp.interfaces.rest.dto.tipocosto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TipoCostoUpdateRequest(
        @NotBlank(message = "Tipo_costo es obligatorio.")
        @Size(max = 120, message = "Tipo_costo no debe exceder 120 caracteres.")
        String tipoCosto,

        @NotBlank(message = "Flujo es obligatorio.")
        @Size(max = 60, message = "Flujo no debe exceder 60 caracteres.")
        String flujo,

        @Size(max = 500, message = "Descripcion no debe exceder 500 caracteres.")
        String descripcion,

        @NotBlank(message = "Estado es obligatorio.")
        @Size(max = 32, message = "Estado no debe exceder 32 caracteres.")
        String estado
) {}
