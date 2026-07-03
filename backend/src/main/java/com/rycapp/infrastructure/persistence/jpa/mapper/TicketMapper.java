package com.rycapp.infrastructure.persistence.jpa.mapper;

import com.rycapp.domain.model.Ticket;
import com.rycapp.infrastructure.persistence.jpa.entity.TicketEntity;

public final class TicketMapper {

    private TicketMapper() {}

    public static Ticket toDomain(TicketEntity entity) {
        if (entity == null) return null;
        return new Ticket(
                entity.getId(),
                entity.getOperacion().getId(),
                entity.getUsuarioCarga().getId(),
                entity.getNumeroTicket(),
                entity.getNombreArchivoOriginal(),
                entity.getHashSha256(),
                entity.getTipoContenidoOriginal(),
                entity.getTamanoBytesOriginal(),
                TimeMapper.toInstantUtc(entity.getFechaCarga())
        );
    }
}
