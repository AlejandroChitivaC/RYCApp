package com.rycapp.domain.model;

import java.math.BigDecimal;
import java.time.Instant;

public record CostoAdministrativo(
        String id,
        String usuarioRegistroId,
        String tipoCostoId,
        Instant fechaInsercion,
        Instant fechaInicio,
        Instant fechaFin,
        String medioPago,
        BigDecimal valor,
        String descripcion
) {}
