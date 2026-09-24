package com.rycapp.interfaces.rest.dto.costoadmin;

import java.math.BigDecimal;
import java.time.Instant;

public record CostoAdministrativoResponse(
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
