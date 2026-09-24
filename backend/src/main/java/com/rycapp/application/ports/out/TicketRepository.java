package com.rycapp.application.ports.out;

import com.rycapp.domain.model.Ticket;
import com.rycapp.domain.model.TicketAuditoria;

import java.util.List;
import java.util.Optional;

public interface TicketRepository {
    Ticket save(Ticket ticket);

    Optional<Ticket> findById(String id);

    List<Ticket> findAll();

    List<Ticket> findByOperacionId(String operacionId);

    boolean existsByHashSha256(String hashSha256);

    boolean existsByNumeroTicket(String numeroTicket);

    void saveAuditoria(TicketAuditoria auditoria);

    List<TicketAuditoria> findAllAuditoria();

    List<TicketAuditoria> findAuditoriaByTicketId(String ticketId);
}
