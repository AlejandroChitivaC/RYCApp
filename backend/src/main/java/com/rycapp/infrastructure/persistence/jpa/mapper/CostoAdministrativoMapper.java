package com.rycapp.infrastructure.persistence.jpa.mapper;

import com.rycapp.domain.model.CostoAdministrativo;
import com.rycapp.infrastructure.persistence.jpa.entity.CostoAdministrativoEntity;

public final class CostoAdministrativoMapper {
    private CostoAdministrativoMapper() {}

    public static CostoAdministrativo toDomain(CostoAdministrativoEntity entity) {
        if (entity == null) return null;
        return new CostoAdministrativo(
                entity.getId(),
                entity.getUsuarioRegistro().getId(),
                entity.getTipoCosto().getId(),
                TimeMapper.toInstantUtc(entity.getFechaInsercion()),
                entity.getFechaInicio() != null ? TimeMapper.toInstantUtc(entity.getFechaInicio()) : null,
                entity.getFechaFin() != null ? TimeMapper.toInstantUtc(entity.getFechaFin()) : null,
                entity.getMedioPago(),
                entity.getValor(),
                entity.getDescripcion()
        );
    }
}
