package com.rycapp.domain.model;

import java.math.BigDecimal;
import java.time.Instant;

public record Nomina(
        Long id,
        Long usuarioRegistroId,
        Long tipoCostoId,
        Long usuarioDebitadoId,
        Instant fechaInsercion,
        Instant fechaInicio,
        Instant fechaFin,
        String medioPago,
        BigDecimal valor,
        String descripcion
) {}
