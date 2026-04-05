package com.rycapp.infrastructure.persistence.jpa.mapper;

import com.rycapp.domain.model.Rol;
import com.rycapp.infrastructure.persistence.jpa.entity.RolEntity;

public final class RolMapper {
    private RolMapper() {}

    public static Rol toDomain(RolEntity entity) {
        if (entity == null) return null;
        return new Rol(entity.getId(), entity.getDescripcion());
    }
}
