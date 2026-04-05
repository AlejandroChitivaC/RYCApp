package com.rycapp.infrastructure.persistence.jpa.mapper;

import com.rycapp.domain.model.Nomina;
import com.rycapp.infrastructure.persistence.jpa.entity.NominaEntity;

public final class NominaMapper {
    private NominaMapper() {}

    public static Nomina toDomain(NominaEntity entity) {
        if (entity == null) return null;
        return new Nomina(
                entity.getId(),
                entity.getUsuarioRegistro().getId(),
                entity.getTipoCosto().getId(),
                entity.getUsuarioDebitado().getId(),
                TimeMapper.toInstantUtc(entity.getFechaInsercion()),
                entity.getFechaInicio() != null ? TimeMapper.toInstantUtc(entity.getFechaInicio()) : null,
                entity.getFechaFin() != null ? TimeMapper.toInstantUtc(entity.getFechaFin()) : null,
                entity.getMedioPago(),
                entity.getValor(),
                entity.getDescripcion()
        );
    }
}
