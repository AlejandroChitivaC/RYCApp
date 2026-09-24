package com.rycapp.interfaces.rest.dto.ticket;

import java.time.Instant;

public record TicketAuditoriaResponse(
        String id,
        String ticketId,
        String usuarioId,
        String usuarioNombre,
        String usuarioApellido,
        Instant fechaAccion,
        String accion
) {}
