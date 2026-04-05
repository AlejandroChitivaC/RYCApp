package com.rycapp.infrastructure.persistence.jpa.mapper;

import com.rycapp.domain.model.TipoCosto;
import com.rycapp.infrastructure.persistence.jpa.entity.TipoCostoEntity;

public final class TipoCostoMapper {
    private TipoCostoMapper() {}

    public static TipoCosto toDomain(TipoCostoEntity entity) {
        if (entity == null) return null;
        return new TipoCosto(
                entity.getId(),
                entity.getTipoCosto(),
                entity.getFlujo(),
                entity.getDescripcion(),
                entity.getEstado()
        );
    }

    public static TipoCostoEntity toEntity(TipoCosto domain) {
        if (domain == null) return null;
        var e = new TipoCostoEntity();
        e.setId(domain.id());
        e.setTipoCosto(domain.tipoCosto());
        e.setFlujo(domain.flujo());
        e.setDescripcion(domain.descripcion());
        e.setEstado(domain.estado());
        return e;
    }
}
