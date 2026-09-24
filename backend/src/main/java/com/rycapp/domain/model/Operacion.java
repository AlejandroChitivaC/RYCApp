package com.rycapp.domain.model;

import java.math.BigDecimal;
import java.time.Instant;

public record Operacion(
        String id,
        String usuarioRegistroId,
        String lineaNegocioId,
        String vehiculoId,
        String materialId,
        String proveedorId,
        Instant fechaInsercion,
        Instant fechaInicio,
        Instant fechaFin,
        String medioPago,
        BigDecimal valor,
        String descripcion,
        String estado
) {}
