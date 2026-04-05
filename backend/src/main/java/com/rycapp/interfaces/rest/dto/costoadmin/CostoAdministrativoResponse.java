package com.rycapp.interfaces.rest.dto.costoadmin;

import java.math.BigDecimal;
import java.time.Instant;

public record CostoAdministrativoResponse(
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
