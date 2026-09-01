package com.rycapp.domain.model;

import java.math.BigDecimal;
import java.time.Instant;

public record Operacion(
        Long id,
        Long usuarioRegistroId,
        Long lineaNegocioId,
        Long vehiculoId,
        Long materialId,
        Long proveedorId,
        Instant fechaInsercion,
        Instant fechaInicio,
        Instant fechaFin,
        String medioPago,
        BigDecimal valor,
        String descripcion,
        String estado
) {}
