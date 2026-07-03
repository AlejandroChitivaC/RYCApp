package com.rycapp.application.service;

import com.rycapp.application.exception.ConflictException;
import com.rycapp.application.exception.NotFoundException;
import com.rycapp.application.ports.in.TicketUseCase;
import com.rycapp.application.ports.out.OperacionRepository;
import com.rycapp.application.ports.out.PdfConversionPort;
import com.rycapp.application.ports.out.TicketRepository;
import com.rycapp.application.ports.out.UsuarioRepository;
import com.rycapp.domain.model.Ticket;
import com.rycapp.domain.model.TicketAuditoria;
import com.rycapp.application.util.Sha256Hasher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Set;

@Service
public class TicketService implements TicketUseCase {

    private static final Logger log = LoggerFactory.getLogger(TicketService.class);

    private static final Set<String> TIPOS_IMAGEN_PERMITIDOS = Set.of(
            "image/jpeg", "image/jpg", "image/png", "image/gif", "image/bmp"
    );

    private static final long TAMANO_MAXIMO_BYTES = 10L * 1024 * 1024;

    private final TicketRepository ticketRepository;
    private final OperacionRepository operacionRepository;
    private final UsuarioRepository usuarioRepository;
    private final PdfConversionPort pdfConversionPort;

    public TicketService(
            TicketRepository ticketRepository,
            OperacionRepository operacionRepository,
            UsuarioRepository usuarioRepository,
            PdfConversionPort pdfConversionPort
    ) {
        this.ticketRepository = ticketRepository;
        this.operacionRepository = operacionRepository;
        this.usuarioRepository = usuarioRepository;
        this.pdfConversionPort = pdfConversionPort;
    }

    @Override
    @Transactional
    public Ticket cargar(
            Long usuarioCargaId,
            Long operacionId,
            String numeroTicket,
            String nombreArchivoOriginal,
            String tipoContenidoOriginal,
            byte[] contenidoImagen
    ) {
        if (contenidoImagen == null || contenidoImagen.length == 0) {
            throw new IllegalArgumentException("El archivo no puede estar vacío.");
        }
        if (contenidoImagen.length > TAMANO_MAXIMO_BYTES) {
            throw new IllegalArgumentException("El archivo supera el tamaño máximo permitido de 10 MB.");
        }

        String tipo = tipoContenidoOriginal != null ? tipoContenidoOriginal.toLowerCase().trim() : "";
        if (!TIPOS_IMAGEN_PERMITIDOS.contains(tipo)) {
            throw new IllegalArgumentException(
                    "Solo se permiten imágenes (JPEG, PNG, GIF, BMP). Tipo recibido: " + tipoContenidoOriginal + ".");
        }

        usuarioRepository.findById(usuarioCargaId)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado (id=" + usuarioCargaId + ")."));
        operacionRepository.findById(operacionId)
                .orElseThrow(() -> new NotFoundException("Operación no encontrada (id=" + operacionId + ")."));

        String hash = Sha256Hasher.hex(contenidoImagen);
        if (ticketRepository.existsByHashSha256(hash)) {
            throw new ConflictException("Ya existe un ticket con el mismo contenido (duplicado por hash).");
        }

        String numeroNormalizado = (numeroTicket != null && !numeroTicket.isBlank())
                ? numeroTicket.trim() : null;
        if (numeroNormalizado != null && ticketRepository.existsByNumeroTicket(numeroNormalizado)) {
            throw new ConflictException("Ya existe un ticket con el número '" + numeroNormalizado + "'.");
        }

        byte[] pdf = pdfConversionPort.imagenAPdf(contenidoImagen, tipoContenidoOriginal);

        var ticket = ticketRepository.save(new Ticket(
                null,
                operacionId,
                usuarioCargaId,
                numeroNormalizado,
                nombreArchivoOriginal != null ? nombreArchivoOriginal : "ticket",
                hash,
                tipoContenidoOriginal,
                (long) contenidoImagen.length,
                Instant.now()
        ), pdf);

        ticketRepository.saveAuditoria(new TicketAuditoria(
                null, ticket.id(), usuarioCargaId, null, null, Instant.now(), "CARGA"
        ));

        log.info("Ticket cargado id={} operacionId={} usuarioCargaId={}", ticket.id(), operacionId, usuarioCargaId);
        return ticket;
    }

    @Override
    public Ticket obtener(Long id, Long usuarioId) {
        var ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Ticket no encontrado (id=" + id + ")."));
        registrarAuditoria(ticket.id(), usuarioId, "CONSULTA");
        return ticket;
    }

    @Override
    public List<Ticket> listar(Long operacionId) {
        if (operacionId != null) {
            return ticketRepository.findByOperacionId(operacionId);
        }
        return ticketRepository.findAll();
    }

    @Override
    public byte[] obtenerContenidoPdf(Long id, Long usuarioId, String accionAuditoria) {
        return obtenerPdf(id, usuarioId, accionAuditoria).contenido();
    }

    @Override
    public TicketPdfContenido obtenerPdf(Long id, Long usuarioId, String accionAuditoria) {
        var ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Ticket no encontrado (id=" + id + ")."));
        var pdf = ticketRepository.findContenidoPdfById(id)
                .orElseThrow(() -> new NotFoundException("Contenido PDF no encontrado para el ticket (id=" + id + ")."));
        registrarAuditoria(ticket.id(), usuarioId, accionAuditoria);
        String nombreBase = ticket.nombreArchivoOriginal().replaceAll("\\.[^.]+$", "");
        return new TicketPdfContenido(pdf, nombreBase + ".pdf");
    }

    private void registrarAuditoria(Long ticketId, Long usuarioId, String accion) {
        ticketRepository.saveAuditoria(new TicketAuditoria(
                null, ticketId, usuarioId, null, null, Instant.now(), accion
        ));
        log.info("Auditoría ticket id={} usuarioId={} accion={}", ticketId, usuarioId, accion);
    }

    @Override
    public List<TicketAuditoria> listarAuditoria(Long ticketId) {
        if (ticketId != null) {
            return ticketRepository.findAuditoriaByTicketId(ticketId);
        }
        return ticketRepository.findAllAuditoria();
    }
}
