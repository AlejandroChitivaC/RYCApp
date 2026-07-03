package com.rycapp.interfaces.rest.dto.ticket;

import java.time.Instant;

public record TicketResponse(
        Long id,
        Long operacionId,
        Long usuarioCargaId,
        String numeroTicket,
        String nombreArchivoOriginal,
        String tipoContenidoOriginal,
        Long tamanoBytesOriginal,
        Instant fechaCarga
) {}
