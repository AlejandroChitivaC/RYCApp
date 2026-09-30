package com.rycapp.application.service;

import com.rycapp.application.exception.ConflictException;
import com.rycapp.application.exception.NotFoundException;
import com.rycapp.application.ports.in.TicketUseCase;
import com.rycapp.application.ports.out.OperacionRepository;
import com.rycapp.application.ports.out.PdfConversionPort;
import com.rycapp.application.ports.out.TicketArchivoStorage;
import com.rycapp.application.ports.out.TicketRepository;
import com.rycapp.application.ports.out.UsuarioRepository;
import com.rycapp.application.util.Ids;
import com.rycapp.application.util.Sha256Hasher;
import com.rycapp.domain.model.Ticket;
import com.rycapp.domain.model.TicketAuditoria;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Set;

@Service
public class TicketService implements TicketUseCase {
    private static final Logger log = LoggerFactory.getLogger(TicketService.class);
    private static final Set<String> TIPOS_IMAGEN = Set.of(
            "image/jpeg", "image/jpg", "image/pjpeg", "image/png", "image/x-png", "image/gif", "image/bmp"
    );
    private static final long TAMANO_MAXIMO = 4L * 1024 * 1024;

    private final TicketRepository ticketRepository;
    private final TicketArchivoStorage archivoStorage;
    private final OperacionRepository operacionRepository;
    private final UsuarioRepository usuarioRepository;
    private final PdfConversionPort pdfConversionPort;

    public TicketService(
            TicketRepository ticketRepository,
            TicketArchivoStorage archivoStorage,
            OperacionRepository operacionRepository,
            UsuarioRepository usuarioRepository,
            PdfConversionPort pdfConversionPort
    ) {
        this.ticketRepository = ticketRepository;
        this.archivoStorage = archivoStorage;
        this.operacionRepository = operacionRepository;
        this.usuarioRepository = usuarioRepository;
        this.pdfConversionPort = pdfConversionPort;
    }

    @Override
    public Ticket cargar(
            String usuarioCargaId,
            String operacionId,
            String numeroTicket,
            String nombreArchivoOriginal,
            String tipoContenidoOriginal,
            byte[] contenidoImagen
    ) {
        if (contenidoImagen == null || contenidoImagen.length == 0) {
            throw new IllegalArgumentException("El archivo no puede estar vacío.");
        }
        if (contenidoImagen.length > TAMANO_MAXIMO) {
            throw new IllegalArgumentException("El archivo supera el tamaño máximo de 4 MB.");
        }
        String tipo = normalizarTipo(tipoContenidoOriginal);
        if (!TIPOS_IMAGEN.contains(tipo)) {
            throw new IllegalArgumentException("Solo se permiten imágenes (JPEG, PNG, GIF, BMP).");
        }

        usuarioRepository.findById(usuarioCargaId)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado (id=" + usuarioCargaId + ")."));
        operacionRepository.findById(operacionId)
                .orElseThrow(() -> new NotFoundException("Operación no encontrada (id=" + operacionId + ")."));

        String hash = Sha256Hasher.hex(contenidoImagen);
        if (ticketRepository.existsByHashSha256(hash)) {
            throw new ConflictException("Ya existe un ticket con el mismo contenido.");
        }
        String numero = (numeroTicket != null && !numeroTicket.isBlank()) ? numeroTicket.trim() : null;
        if (numero != null && ticketRepository.existsByNumeroTicket(numero)) {
            throw new ConflictException("Ya existe un ticket con el número '" + numero + "'.");
        }

        byte[] pdf = pdfConversionPort.imagenAPdf(contenidoImagen, tipoContenidoOriginal);
        String id = Ids.nuevo();
        archivoStorage.guardarPdf(id, pdf);
        var ticket = ticketRepository.save(new Ticket(
                id,
                operacionId,
                usuarioCargaId,
                numero,
                nombreArchivoOriginal != null ? nombreArchivoOriginal : "ticket",
                hash,
                tipoContenidoOriginal,
                (long) contenidoImagen.length,
                Instant.now()
        ));
        ticketRepository.saveAuditoria(new TicketAuditoria(
                null, ticket.id(), usuarioCargaId, null, null, Instant.now(), "CARGA"
        ));
        log.info("Ticket cargado id={} operacionId={}", ticket.id(), operacionId);
        return ticket;
    }

    @Override
    public Ticket obtener(String id, String usuarioId) {
        var ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Ticket no encontrado (id=" + id + ")."));
        registrarAuditoria(ticket.id(), usuarioId, "CONSULTA");
        return ticket;
    }

    @Override
    public List<Ticket> listar(String operacionId) {
        if (operacionId != null) {
            return ticketRepository.findByOperacionId(operacionId);
        }
        return ticketRepository.findAll();
    }

    @Override
    public TicketPdfEnlace obtenerPdf(String id, String usuarioId, String accionAuditoria) {
        var ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Ticket no encontrado (id=" + id + ")."));
        registrarAuditoria(ticket.id(), usuarioId, accionAuditoria);
        String nombreBase = ticket.nombreArchivoOriginal().replaceAll("\\.[^.]+$", "");
        return new TicketPdfEnlace(archivoStorage.urlPrefirmada(id), nombreBase + ".pdf");
    }

    @Override
    public byte[] leerArchivo(String id, String usuarioId) {
        ticketRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Ticket no encontrado (id=" + id + ")."));
        registrarAuditoria(id, usuarioId, "DESCARGA");
        return archivoStorage.leerPdf(id);
    }

    @Override
    public List<TicketAuditoria> listarAuditoria(String ticketId) {
        if (ticketId != null) {
            return ticketRepository.findAuditoriaByTicketId(ticketId);
        }
        return ticketRepository.findAllAuditoria();
    }

    private void registrarAuditoria(String ticketId, String usuarioId, String accion) {
        ticketRepository.saveAuditoria(new TicketAuditoria(
                null, ticketId, usuarioId, null, null, Instant.now(), accion
        ));
    }

    private static String normalizarTipo(String contentType) {
        if (contentType == null) {
            return "";
        }
        String tipo = contentType.toLowerCase().trim();
        int separador = tipo.indexOf(';');
        if (separador >= 0) {
            tipo = tipo.substring(0, separador).trim();
        }
        if ("image/pjpeg".equals(tipo) || "image/jpg".equals(tipo)) {
            return "image/jpeg";
        }
        if ("image/x-png".equals(tipo)) {
            return "image/png";
        }
        return tipo;
    }
}
