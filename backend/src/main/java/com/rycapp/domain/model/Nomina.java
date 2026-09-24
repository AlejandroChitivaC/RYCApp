package com.rycapp.domain.model;

import java.math.BigDecimal;
import java.time.Instant;

public record Nomina(
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
