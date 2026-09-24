package com.rycapp.domain.model;

import java.time.Instant;

public record TicketAuditoria(
        String id,
        String ticketId,
        String usuarioId,
        String usuarioNombre,
        String usuarioApellido,
        Instant fechaAccion,
        String accion
) {}
