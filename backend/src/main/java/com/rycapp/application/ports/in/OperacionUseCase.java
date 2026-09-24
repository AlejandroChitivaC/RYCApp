package com.rycapp.application.ports.in;

import com.rycapp.domain.model.Operacion;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public interface OperacionUseCase {
    Operacion crear(
            String usuarioRegistroId,
            String lineaNegocioId,
            String vehiculoId,
            String materialId,
            String proveedorId,
            Instant fechaInicio,
            Instant fechaFin,
            String medioPago,
            BigDecimal valor,
            String descripcion
    );

    Operacion obtener(String id);

    List<Operacion> listar();

    List<Operacion> filtrar(
            Instant fromInclusive,
            Instant toInclusive,
            String lineaNegocioId,
            String vehiculoId,
            String proveedorId
    );

    Operacion confirmar(String id);
}
