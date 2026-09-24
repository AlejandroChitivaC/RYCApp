package com.rycapp.domain.model;

import java.time.Instant;

public record Ticket(
        String id,
        String operacionId,
        String usuarioCargaId,
        String numeroTicket,
        String nombreArchivoOriginal,
        String hashSha256,
        String tipoContenidoOriginal,
        Long tamanoBytesOriginal,
        Instant fechaCarga
) {}
