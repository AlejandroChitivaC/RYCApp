package com.rycapp.infrastructure.persistence.jpa.mapper;

import com.rycapp.domain.model.CostoFinancieroOtrosGastos;
import com.rycapp.infrastructure.persistence.jpa.entity.CostoFinancieroOtrosGastosEntity;

public final class CostoFinancieroOtrosGastosMapper {
    private CostoFinancieroOtrosGastosMapper() {}

    public static CostoFinancieroOtrosGastos toDomain(CostoFinancieroOtrosGastosEntity entity) {
        if (entity == null) return null;
        return new CostoFinancieroOtrosGastos(
                entity.getId(),
                entity.getUsuarioRegistro().getId(),
                entity.getTipoCosto().getId(),
                TimeMapper.toInstantUtc(entity.getFechaInsercion()),
                entity.getMedioPago(),
                entity.getValor(),
                entity.getDescripcion()
        );
    }
}
