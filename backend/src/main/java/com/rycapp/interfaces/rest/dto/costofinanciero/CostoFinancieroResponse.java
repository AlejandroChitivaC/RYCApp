package com.rycapp.interfaces.rest.dto.costofinanciero;

import java.math.BigDecimal;
import java.time.Instant;

public record CostoFinancieroResponse(
        String id,
        String usuarioRegistroId,
        String tipoCostoId,
        Instant fechaInsercion,
        String medioPago,
        BigDecimal valor,
        String descripcion
) {}
