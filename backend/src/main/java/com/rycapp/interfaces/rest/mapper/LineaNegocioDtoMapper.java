package com.rycapp.interfaces.rest.mapper;

import com.rycapp.domain.model.LineaNegocio;
import com.rycapp.interfaces.rest.dto.lineanegocio.LineaNegocioResponse;

public final class LineaNegocioDtoMapper {
    private LineaNegocioDtoMapper() {}

    public static LineaNegocioResponse toResponse(LineaNegocio domain) {
        return new LineaNegocioResponse(
                domain.id(),
                domain.lineaNegocio(),
                domain.descripcion(),
                domain.estado()
        );
    }
}
