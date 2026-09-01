package com.rycapp.interfaces.rest.mapper;

import com.rycapp.domain.model.Operacion;
import com.rycapp.interfaces.rest.dto.operacion.OperacionResponse;

public final class OperacionDtoMapper {
    private OperacionDtoMapper() {}

    public static OperacionResponse toResponse(Operacion domain) {
        return new OperacionResponse(
                domain.id(),
                domain.usuarioRegistroId(),
                domain.lineaNegocioId(),
                domain.vehiculoId(),
                domain.materialId(),
                domain.proveedorId(),
                domain.fechaInsercion(),
                domain.fechaInicio(),
                domain.fechaFin(),
                domain.medioPago(),
                domain.valor(),
                domain.descripcion(),
                domain.estado(),
                null,
                null
        );
    }

    public static OperacionResponse toResponse(Operacion domain, String estadoPago, String facturaSiigo) {
        return new OperacionResponse(
                domain.id(),
                domain.usuarioRegistroId(),
                domain.lineaNegocioId(),
                domain.vehiculoId(),
                domain.materialId(),
                domain.proveedorId(),
                domain.fechaInsercion(),
                domain.fechaInicio(),
                domain.fechaFin(),
                domain.medioPago(),
                domain.valor(),
                domain.descripcion(),
                domain.estado(),
                estadoPago,
                facturaSiigo
        );
    }
}
