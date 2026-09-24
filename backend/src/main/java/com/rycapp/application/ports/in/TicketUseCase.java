package com.rycapp.application.ports.in;

import com.rycapp.domain.model.Ticket;
import com.rycapp.domain.model.TicketAuditoria;

import java.util.List;

public interface TicketUseCase {

    Ticket cargar(
            String usuarioCargaId,
            String operacionId,
            String numeroTicket,
            String nombreArchivoOriginal,
            String tipoContenidoOriginal,
            byte[] contenidoImagen
    );

    Ticket obtener(String id, String usuarioId);

    List<Ticket> listar(String operacionId);

    record TicketPdfEnlace(String url, String nombreArchivo) {}

    TicketPdfEnlace obtenerPdf(String id, String usuarioId, String accionAuditoria);

    byte[] leerArchivo(String id, String usuarioId);

    List<TicketAuditoria> listarAuditoria(String ticketId);
}
