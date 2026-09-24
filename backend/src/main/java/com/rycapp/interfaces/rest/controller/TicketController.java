package com.rycapp.interfaces.rest.controller;

import com.rycapp.application.ports.in.TicketUseCase;
import com.rycapp.infrastructure.security.JwtPrincipal;
import com.rycapp.interfaces.rest.dto.ticket.TicketAuditoriaResponse;
import com.rycapp.interfaces.rest.dto.ticket.TicketPdfResponse;
import com.rycapp.interfaces.rest.dto.ticket.TicketResponse;
import com.rycapp.interfaces.rest.mapper.TicketDtoMapper;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketUseCase useCase;

    public TicketController(TicketUseCase useCase) {
        this.useCase = useCase;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_CONDUCTOR')")
    public ResponseEntity<TicketResponse> cargar(
            @AuthenticationPrincipal JwtPrincipal principal,
            @RequestParam("operacionId") String operacionId,
            @RequestParam(value = "numeroTicket", required = false) String numeroTicket,
            @RequestParam("archivo") MultipartFile archivo
    ) throws IOException {
        var ticket = useCase.cargar(
                principal.usuarioId(),
                operacionId,
                numeroTicket,
                archivo.getOriginalFilename() != null ? archivo.getOriginalFilename() : "ticket",
                archivo.getContentType() != null ? archivo.getContentType() : "",
                archivo.getBytes()
        );
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}").buildAndExpand(ticket.id()).toUri();
        return ResponseEntity.created(location).body(TicketDtoMapper.toResponse(ticket));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_CONTADOR')")
    public ResponseEntity<List<TicketResponse>> listar(
            @RequestParam(value = "operacionId", required = false) String operacionId
    ) {
        var items = useCase.listar(operacionId).stream()
                .map(TicketDtoMapper::toResponse)
                .toList();
        return ResponseEntity.ok(items);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_CONTADOR')")
    public ResponseEntity<TicketResponse> obtener(
            @PathVariable String id,
            @AuthenticationPrincipal JwtPrincipal principal
    ) {
        return ResponseEntity.ok(TicketDtoMapper.toResponse(useCase.obtener(id, principal.usuarioId())));
    }

    @GetMapping("/{id}/pdf")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_CONTADOR')")
    public ResponseEntity<TicketPdfResponse> enlacePdf(
            @PathVariable String id,
            @AuthenticationPrincipal JwtPrincipal principal,
            @RequestParam(value = "disposition", defaultValue = "attachment") String disposition
    ) {
        boolean inline = "inline".equalsIgnoreCase(disposition);
        String accion = inline ? "VISUALIZACION" : "DESCARGA";
        var pdf = useCase.obtenerPdf(id, principal.usuarioId(), accion);
        return ResponseEntity.ok(new TicketPdfResponse(pdf.url(), pdf.nombreArchivo()));
    }

    @GetMapping("/{id}/archivo")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_CONTADOR')")
    public ResponseEntity<byte[]> archivo(
            @PathVariable String id,
            @AuthenticationPrincipal JwtPrincipal principal
    ) {
        byte[] pdf = useCase.leerArchivo(id, principal.usuarioId());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"ticket.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/auditoria")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<TicketAuditoriaResponse>> auditoria() {
        var items = useCase.listarAuditoria(null).stream()
                .map(TicketDtoMapper::toAuditoriaResponse)
                .toList();
        return ResponseEntity.ok(items);
    }

    @GetMapping("/{id}/auditoria")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<TicketAuditoriaResponse>> auditoriaPorTicket(@PathVariable String id) {
        var items = useCase.listarAuditoria(id).stream()
                .map(TicketDtoMapper::toAuditoriaResponse)
                .toList();
        return ResponseEntity.ok(items);
    }
}
