package com.rycapp.application.ports.in;

import com.rycapp.domain.model.Operacion;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public interface OperacionUseCase {
    Operacion crear(
            Long usuarioRegistroId,
            Long lineaNegocioId,
            Long vehiculoId,
            Long materialId,
            Long proveedorId,
            Instant fechaInicio,
            Instant fechaFin,
            String medioPago,
            BigDecimal valor,
            String descripcion
    );

    Operacion obtener(Long id);

    List<Operacion> listar();

    List<Operacion> filtrar(
            Instant fromInclusive,
            Instant toInclusive,
            Long lineaNegocioId,
            Long vehiculoId,
            Long proveedorId
    );
}
