package com.rycapp.domain.model;

import java.math.BigDecimal;
import java.time.Instant;

public record CostoFinancieroOtrosGastos(
        Long id,
        Long usuarioRegistroId,
        Long tipoCostoId,
        Instant fechaInsercion,
        String medioPago,
        BigDecimal valor,
        String descripcion
) {}
