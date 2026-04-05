package com.rycapp.interfaces.rest.dto.lineanegocio;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LineaNegocioUpdateRequest(
        @NotBlank(message = "Linea_Negocio es obligatorio.")
        @Size(max = 120, message = "Linea_Negocio no debe exceder 120 caracteres.")
        String lineaNegocio,

        @Size(max = 500, message = "La descripción no debe exceder 500 caracteres.")
        String descripcion
) {}
