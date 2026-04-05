package com.rycapp.infrastructure.persistence.jpa.mapper;

import com.rycapp.domain.model.Operacion;
import com.rycapp.infrastructure.persistence.jpa.entity.OperacionEntity;

public final class OperacionMapper {
    private OperacionMapper() {}

    public static Operacion toDomain(OperacionEntity entity) {
        if (entity == null) return null;
        return new Operacion(
                entity.getId(),
                entity.getUsuarioRegistro().getId(),
                entity.getLineaNegocio().getId(),
                entity.getVehiculo().getId(),
                entity.getMaterial().getId(),
                entity.getProveedor().getId(),
                TimeMapper.toInstantUtc(entity.getFechaInsercion()),
                entity.getFechaInicio() != null ? TimeMapper.toInstantUtc(entity.getFechaInicio()) : null,
                entity.getFechaFin() != null ? TimeMapper.toInstantUtc(entity.getFechaFin()) : null,
                entity.getMedioPago(),
                entity.getValor(),
                entity.getDescripcion()
        );
    }
}
