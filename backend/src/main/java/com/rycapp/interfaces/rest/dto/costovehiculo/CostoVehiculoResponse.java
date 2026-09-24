package com.rycapp.interfaces.rest.dto.costovehiculo;

import java.math.BigDecimal;
import java.time.Instant;

public record CostoVehiculoResponse(
        String id,
        String usuarioRegistroId,
        String tipoCostoId,
        String vehiculoId,
        Instant fechaInsercion,
        Instant fechaInicio,
        Instant fechaFin,
        String medioPago,
        BigDecimal valor,
        String motivo,
        String descripcion
) {}
