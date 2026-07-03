package com.rycapp.interfaces.rest.mapper;

import com.rycapp.domain.model.Ticket;
import com.rycapp.domain.model.TicketAuditoria;
import com.rycapp.interfaces.rest.dto.ticket.TicketAuditoriaResponse;
import com.rycapp.interfaces.rest.dto.ticket.TicketResponse;

public final class TicketDtoMapper {

    private TicketDtoMapper() {}

    public static TicketResponse toResponse(Ticket domain) {
        return new TicketResponse(
                domain.id(),
                domain.operacionId(),
                domain.usuarioCargaId(),
                domain.numeroTicket(),
                domain.nombreArchivoOriginal(),
                domain.tipoContenidoOriginal(),
                domain.tamanoBytesOriginal(),
                domain.fechaCarga()
        );
    }

    public static TicketAuditoriaResponse toAuditoriaResponse(TicketAuditoria domain) {
        return new TicketAuditoriaResponse(
                domain.id(),
                domain.ticketId(),
                domain.usuarioId(),
                domain.usuarioNombre(),
                domain.usuarioApellido(),
                domain.fechaAccion(),
                domain.accion()
        );
    }
}
