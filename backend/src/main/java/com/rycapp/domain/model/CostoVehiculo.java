package com.rycapp.domain.model;

import java.math.BigDecimal;
import java.time.Instant;

public record CostoVehiculo(
        Long id,
        Long usuarioRegistroId,
        Long tipoCostoId,
        Long vehiculoId,
        Instant fechaInsercion,
        Instant fechaInicio,
        Instant fechaFin,
        String medioPago,
        BigDecimal valor,
        String motivo,
        String descripcion
) {}
