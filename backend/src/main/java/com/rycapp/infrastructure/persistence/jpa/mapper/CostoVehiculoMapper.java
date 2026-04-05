package com.rycapp.infrastructure.persistence.jpa.mapper;

import com.rycapp.domain.model.CostoVehiculo;
import com.rycapp.infrastructure.persistence.jpa.entity.CostoVehiculoEntity;

public final class CostoVehiculoMapper {
    private CostoVehiculoMapper() {}

    public static CostoVehiculo toDomain(CostoVehiculoEntity entity) {
        if (entity == null) return null;
        return new CostoVehiculo(
                entity.getId(),
                entity.getUsuarioRegistro().getId(),
                entity.getTipoCosto().getId(),
                entity.getVehiculo().getId(),
                TimeMapper.toInstantUtc(entity.getFechaInsercion()),
                entity.getFechaInicio() != null ? TimeMapper.toInstantUtc(entity.getFechaInicio()) : null,
                entity.getFechaFin() != null ? TimeMapper.toInstantUtc(entity.getFechaFin()) : null,
                entity.getMedioPago(),
                entity.getValor(),
                entity.getMotivo(),
                entity.getDescripcion()
        );
    }
}
