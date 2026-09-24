package com.rycapp.domain.model;

import java.math.BigDecimal;
import java.time.Instant;

public record CostoFinancieroOtrosGastos(
        String id,
        String usuarioRegistroId,
        String tipoCostoId,
        Instant fechaInsercion,
        String medioPago,
        BigDecimal valor,
        String descripcion
) {}
