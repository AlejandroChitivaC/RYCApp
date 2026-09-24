package com.rycapp.interfaces.rest.dto.costovehiculo;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.Instant;

public record CostoVehiculoCreateRequest(
        @NotNull(message = "usuarioRegistroId es obligatorio.")
        String usuarioRegistroId,

        @NotNull(message = "tipoCostoId es obligatorio.")
        String tipoCostoId,

        @NotNull(message = "vehiculoId es obligatorio.")
        String vehiculoId,

        Instant fechaInicio,
        Instant fechaFin,

        @NotBlank(message = "Medio_Pago es obligatorio.")
        @Size(max = 60, message = "Medio_Pago no debe exceder 60 caracteres.")
        String medioPago,

        @NotNull(message = "Valor es obligatorio.")
        @Positive(message = "Valor debe ser mayor a 0.")
        BigDecimal valor,

        @Size(max = 200, message = "Motivo no debe exceder 200 caracteres.")
        String motivo,

        @Size(max = 500, message = "Descripcion no debe exceder 500 caracteres.")
        String descripcion
) {}
