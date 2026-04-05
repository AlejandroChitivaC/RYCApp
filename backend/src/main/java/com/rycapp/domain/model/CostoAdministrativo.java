package com.rycapp.domain.model;

import java.math.BigDecimal;
import java.time.Instant;

public record CostoAdministrativo(
        Long id,
        Long usuarioRegistroId,
        Long tipoCostoId,
        Instant fechaInsercion,
        Instant fechaInicio,
        Instant fechaFin,
        String medioPago,
        BigDecimal valor,
        String descripcion
) {}
