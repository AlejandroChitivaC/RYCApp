package com.rycapp.infrastructure.persistence.jpa.mapper;

import com.rycapp.domain.model.TicketAuditoria;
import com.rycapp.infrastructure.persistence.jpa.entity.TicketAuditoriaEntity;

public final class TicketAuditoriaMapper {

    private TicketAuditoriaMapper() {}

    public static TicketAuditoria toDomain(TicketAuditoriaEntity entity) {
        if (entity == null) return null;
        return new TicketAuditoria(
                entity.getId(),
                entity.getTicket().getId(),
                entity.getUsuario().getId(),
                entity.getUsuario().getNombre(),
                entity.getUsuario().getApellido(),
                TimeMapper.toInstantUtc(entity.getFechaAccion()),
                entity.getAccion()
        );
    }
}
