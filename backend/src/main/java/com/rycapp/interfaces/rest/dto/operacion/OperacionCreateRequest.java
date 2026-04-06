package com.rycapp.interfaces.rest.dto.operacion;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.Instant;

public record OperacionCreateRequest(
        @NotNull(message = "lineaNegocioId es obligatorio.")
        Long lineaNegocioId,

        @NotNull(message = "vehiculoId es obligatorio.")
        Long vehiculoId,

        @NotNull(message = "materialId es obligatorio.")
        Long materialId,

        @NotNull(message = "proveedorId es obligatorio.")
        Long proveedorId,

        Instant fechaInicio,
        Instant fechaFin,

        @NotBlank(message = "Medio_Pago es obligatorio.")
        @Size(max = 60, message = "Medio_Pago no debe exceder 60 caracteres.")
        String medioPago,

        @NotNull(message = "Valor es obligatorio.")
        @Positive(message = "Valor debe ser mayor a 0.")
        BigDecimal valor,

        @Size(max = 500, message = "Descripcion no debe exceder 500 caracteres.")
        String descripcion
) {}
