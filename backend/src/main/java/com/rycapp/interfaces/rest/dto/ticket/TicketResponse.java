package com.rycapp.interfaces.rest.dto.ticket;

import java.time.Instant;

public record TicketResponse(
        String id,
        String operacionId,
        String usuarioCargaId,
        String numeroTicket,
        String nombreArchivoOriginal,
        String tipoContenidoOriginal,
        Long tamanoBytesOriginal,
        Instant fechaCarga
) {}
