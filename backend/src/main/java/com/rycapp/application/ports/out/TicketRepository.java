package com.rycapp.application.ports.out;

import com.rycapp.domain.model.Ticket;
import com.rycapp.domain.model.TicketAuditoria;

import java.util.List;
import java.util.Optional;

public interface TicketRepository {
    Ticket save(Ticket ticket, byte[] contenidoPdf);

    Optional<Ticket> findById(Long id);

    List<Ticket> findAll();

    List<Ticket> findByOperacionId(Long operacionId);

    boolean existsByHashSha256(String hashSha256);

    boolean existsByNumeroTicket(String numeroTicket);

    Optional<byte[]> findContenidoPdfById(Long id);

    void saveAuditoria(TicketAuditoria auditoria);

    List<TicketAuditoria> findAllAuditoria();

    List<TicketAuditoria> findAuditoriaByTicketId(Long ticketId);
}
