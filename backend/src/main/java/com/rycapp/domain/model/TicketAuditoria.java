package com.rycapp.domain.model;

import java.time.Instant;

public record TicketAuditoria(
        Long id,
        Long ticketId,
        Long usuarioId,
        String usuarioNombre,
        String usuarioApellido,
        Instant fechaAccion,
        String accion
) {}
