package com.rycapp.interfaces.rest.dto.operacion;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.Instant;

public record OperacionCreateRequest(
        @NotNull(message = "lineaNegocioId es obligatorio.")
        String lineaNegocioId,

        @NotNull(message = "vehiculoId es obligatorio.")
        String vehiculoId,

        @NotNull(message = "materialId es obligatorio.")
        String materialId,

        @NotNull(message = "proveedorId es obligatorio.")
        String proveedorId,

        @NotNull(message = "La fecha de inicio es obligatoria.")
        Instant fechaInicio,

        @NotNull(message = "La fecha fin es obligatoria.")
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
