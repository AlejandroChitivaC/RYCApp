package com.rycapp.interfaces.rest.dto.costovehiculo;

import java.math.BigDecimal;
import java.time.Instant;

public record CostoVehiculoResponse(
        Long id,
        Long usuarioRegistroId,
        Long tipoCostoId,
        Long vehiculoId,
        Instant fechaInsercion,
        Instant fechaInicio,
        Instant fechaFin,
        String medioPago,
        BigDecimal valor,
        String motivo,
        String descripcion
) {}
