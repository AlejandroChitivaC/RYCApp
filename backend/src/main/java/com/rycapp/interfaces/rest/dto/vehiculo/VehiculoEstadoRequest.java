package com.rycapp.interfaces.rest.dto.vehiculo;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record VehiculoEstadoRequest(
        @NotBlank(message = "El estado es obligatorio.")
        @Size(max = 32, message = "El estado no debe exceder 32 caracteres.")
        String estado
) {}
