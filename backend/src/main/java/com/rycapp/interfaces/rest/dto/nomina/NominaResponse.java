package com.rycapp.interfaces.rest.dto.nomina;

import java.math.BigDecimal;
import java.time.Instant;

public record NominaResponse(
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
