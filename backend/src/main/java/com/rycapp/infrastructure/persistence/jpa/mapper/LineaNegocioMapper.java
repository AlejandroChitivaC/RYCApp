package com.rycapp.infrastructure.persistence.jpa.mapper;

import com.rycapp.domain.model.LineaNegocio;
import com.rycapp.infrastructure.persistence.jpa.entity.LineaNegocioEntity;

public final class LineaNegocioMapper {
    private LineaNegocioMapper() {}

    public static LineaNegocio toDomain(LineaNegocioEntity entity) {
        if (entity == null) return null;
        return new LineaNegocio(
                entity.getId(),
                entity.getLineaNegocio(),
                entity.getDescripcion(),
                entity.getEstado()
        );
    }

    public static LineaNegocioEntity toEntity(LineaNegocio domain) {
        if (domain == null) return null;
        var e = new LineaNegocioEntity();
        e.setId(domain.id());
        e.setLineaNegocio(domain.lineaNegocio());
        e.setDescripcion(domain.descripcion());
        e.setEstado(domain.estado());
        return e;
    }
}
