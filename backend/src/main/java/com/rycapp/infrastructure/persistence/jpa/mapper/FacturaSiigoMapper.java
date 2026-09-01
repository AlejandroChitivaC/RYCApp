package com.rycapp.infrastructure.persistence.jpa.mapper;

import com.rycapp.domain.model.FacturaSiigo;
import com.rycapp.infrastructure.persistence.jpa.entity.FacturaSiigoEntity;

public final class FacturaSiigoMapper {
    private FacturaSiigoMapper() {}

    public static FacturaSiigo toDomain(FacturaSiigoEntity entity) {
        if (entity == null) {
            return null;
        }
        Long operacionId = entity.getOperacion() != null ? entity.getOperacion().getId() : null;
        return new FacturaSiigo(
                entity.getId(),
                operacionId,
                entity.getSiigoInvoiceId(),
                entity.getNumero(),
                entity.getPrefijo(),
                entity.getFecha(),
                entity.getFechaVencimiento(),
                entity.getIdentificacionCliente(),
                entity.getNombreCliente(),
                entity.getTotal(),
                entity.getSaldo(),
                entity.getEstadoPago(),
                entity.getObservaciones(),
                TimeMapper.toInstantUtc(entity.getFechaSincronizacion())
        );
    }
}
