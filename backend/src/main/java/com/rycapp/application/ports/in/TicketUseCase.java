package com.rycapp.application.ports.in;

import com.rycapp.domain.model.Ticket;
import com.rycapp.domain.model.TicketAuditoria;

import java.util.List;

public interface TicketUseCase {

    Ticket cargar(
            Long usuarioCargaId,
            Long operacionId,
            String numeroTicket,
            String nombreArchivoOriginal,
            String tipoContenidoOriginal,
            byte[] contenidoImagen
    );

    Ticket obtener(Long id, Long usuarioId);

    List<Ticket> listar(Long operacionId);

    byte[] obtenerContenidoPdf(Long id, Long usuarioId, String accionAuditoria);

    record TicketPdfContenido(byte[] contenido, String nombreArchivoDescarga) {}

    TicketPdfContenido obtenerPdf(Long id, Long usuarioId, String accionAuditoria);

    List<TicketAuditoria> listarAuditoria(Long ticketId);
}
