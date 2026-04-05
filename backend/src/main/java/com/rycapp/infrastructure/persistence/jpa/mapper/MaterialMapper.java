package com.rycapp.infrastructure.persistence.jpa.mapper;

import com.rycapp.domain.model.Material;
import com.rycapp.infrastructure.persistence.jpa.entity.MaterialEntity;

public final class MaterialMapper {
    private MaterialMapper() {}

    public static Material toDomain(MaterialEntity entity) {
        if (entity == null) return null;
        return new Material(entity.getId(), entity.getMaterial(), entity.getDescripcion());
    }

    public static MaterialEntity toEntity(Material domain) {
        if (domain == null) return null;
        var e = new MaterialEntity();
        e.setId(domain.id());
        e.setMaterial(domain.material());
        e.setDescripcion(domain.descripcion());
        return e;
    }
}
