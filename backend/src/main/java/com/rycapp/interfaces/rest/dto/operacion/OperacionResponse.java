package com.rycapp.interfaces.rest.dto.operacion;

import java.math.BigDecimal;
import java.time.Instant;

public record OperacionResponse(
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
        String estado,
        String estadoPago,
        String facturaSiigo
) {}
