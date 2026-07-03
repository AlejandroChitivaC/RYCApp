package com.rycapp.interfaces.rest.dto.ticket;

import java.time.Instant;

public record TicketAuditoriaResponse(
        Long id,
        Long ticketId,
        Long usuarioId,
        String usuarioNombre,
        String usuarioApellido,
        Instant fechaAccion,
        String accion
) {}
