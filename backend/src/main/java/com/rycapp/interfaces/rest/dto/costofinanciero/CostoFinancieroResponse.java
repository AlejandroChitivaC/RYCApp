package com.rycapp.interfaces.rest.dto.costofinanciero;

import java.math.BigDecimal;
import java.time.Instant;

public record CostoFinancieroResponse(
        Long id,
        Long usuarioRegistroId,
        Long tipoCostoId,
        Instant fechaInsercion,
        String medioPago,
        BigDecimal valor,
        String descripcion
) {}
