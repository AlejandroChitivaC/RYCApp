package com.rycapp.interfaces.rest.dto.nomina;

import java.math.BigDecimal;
import java.time.Instant;

public record NominaResponse(
        String id,
        String usuarioRegistroId,
        String tipoCostoId,
        String usuarioDebitadoId,
        Instant fechaInsercion,
        Instant fechaInicio,
        Instant fechaFin,
        String medioPago,
        BigDecimal valor,
        String descripcion
) {}
