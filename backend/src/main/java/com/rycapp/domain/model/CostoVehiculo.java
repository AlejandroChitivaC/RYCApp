package com.rycapp.domain.model;

import java.math.BigDecimal;
import java.time.Instant;

public record CostoVehiculo(
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
