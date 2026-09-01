package com.rycapp.interfaces.rest.dto.operacion;

import java.math.BigDecimal;
import java.time.Instant;

public record OperacionResponse(
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
        String estado,
        String estadoPago,
        String facturaSiigo
) {}
