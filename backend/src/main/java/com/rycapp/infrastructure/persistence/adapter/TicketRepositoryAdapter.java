package com.rycapp.infrastructure.persistence.adapter;

import com.rycapp.application.ports.out.TicketRepository;
import com.rycapp.domain.model.Ticket;
import com.rycapp.domain.model.TicketAuditoria;
import com.rycapp.infrastructure.persistence.jpa.entity.TicketAuditoriaEntity;
import com.rycapp.infrastructure.persistence.jpa.entity.TicketContenidoEntity;
import com.rycapp.infrastructure.persistence.jpa.entity.TicketEntity;
import com.rycapp.infrastructure.persistence.jpa.mapper.TicketAuditoriaMapper;
import com.rycapp.infrastructure.persistence.jpa.mapper.TicketMapper;
import com.rycapp.infrastructure.persistence.jpa.mapper.TimeMapper;
import com.rycapp.infrastructure.persistence.jpa.repository.OperacionJpaRepository;
import com.rycapp.infrastructure.persistence.jpa.repository.TicketAuditoriaJpaRepository;
import com.rycapp.infrastructure.persistence.jpa.repository.TicketContenidoJpaRepository;
import com.rycapp.infrastructure.persistence.jpa.repository.TicketJpaRepository;
import com.rycapp.infrastructure.persistence.jpa.repository.UsuarioJpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class TicketRepositoryAdapter implements TicketRepository {

    private final TicketJpaRepository ticketJpaRepository;
    private final TicketContenidoJpaRepository ticketContenidoJpaRepository;
    private final TicketAuditoriaJpaRepository ticketAuditoriaJpaRepository;
    private final OperacionJpaRepository operacionJpaRepository;
    private final UsuarioJpaRepository usuarioJpaRepository;

    public TicketRepositoryAdapter(
            TicketJpaRepository ticketJpaRepository,
            TicketContenidoJpaRepository ticketContenidoJpaRepository,
            TicketAuditoriaJpaRepository ticketAuditoriaJpaRepository,
            OperacionJpaRepository operacionJpaRepository,
            UsuarioJpaRepository usuarioJpaRepository
    ) {
        this.ticketJpaRepository = ticketJpaRepository;
        this.ticketContenidoJpaRepository = ticketContenidoJpaRepository;
        this.ticketAuditoriaJpaRepository = ticketAuditoriaJpaRepository;
        this.operacionJpaRepository = operacionJpaRepository;
        this.usuarioJpaRepository = usuarioJpaRepository;
    }

    @Override
    public Ticket save(Ticket ticket, byte[] contenidoPdf) {
        TicketEntity e = new TicketEntity();
        e.setOperacion(operacionJpaRepository.getReferenceById(ticket.operacionId()));
        e.setUsuarioCarga(usuarioJpaRepository.getReferenceById(ticket.usuarioCargaId()));
        e.setNumeroTicket(ticket.numeroTicket());
        e.setNombreArchivoOriginal(ticket.nombreArchivoOriginal());
        e.setHashSha256(ticket.hashSha256());
        e.setTipoContenidoOriginal(ticket.tipoContenidoOriginal());
        e.setTamanoBytesOriginal(ticket.tamanoBytesOriginal());
        e.setFechaCarga(TimeMapper.toLocalDateTimeUtc(ticket.fechaCarga()));

        var saved = ticketJpaRepository.save(e);

        TicketContenidoEntity contenido = new TicketContenidoEntity();
        contenido.setId(saved.getId());
        contenido.setContenidoPdf(contenidoPdf);
        ticketContenidoJpaRepository.save(contenido);

        return ticketJpaRepository.findOneFetched(saved.getId()).map(TicketMapper::toDomain).orElseThrow();
    }

    @Override
    public Optional<Ticket> findById(Long id) {
        return ticketJpaRepository.findOneFetched(id).map(TicketMapper::toDomain);
    }

    @Override
    public List<Ticket> findAll() {
        return ticketJpaRepository.findAllFetched().stream().map(TicketMapper::toDomain).toList();
    }

    @Override
    public List<Ticket> findByOperacionId(Long operacionId) {
        return ticketJpaRepository.findByOperacionIdFetched(operacionId).stream()
                .map(TicketMapper::toDomain).toList();
    }

    @Override
    public boolean existsByHashSha256(String hashSha256) {
        return ticketJpaRepository.existsByHashSha256(hashSha256);
    }

    @Override
    public boolean existsByNumeroTicket(String numeroTicket) {
        return ticketJpaRepository.existsByNumeroTicket(numeroTicket);
    }

    @Override
    public Optional<byte[]> findContenidoPdfById(Long id) {
        return ticketContenidoJpaRepository.findById(id).map(TicketContenidoEntity::getContenidoPdf);
    }

    @Override
    public void saveAuditoria(TicketAuditoria auditoria) {
        TicketAuditoriaEntity a = new TicketAuditoriaEntity();
        a.setTicket(ticketJpaRepository.getReferenceById(auditoria.ticketId()));
        a.setUsuario(usuarioJpaRepository.getReferenceById(auditoria.usuarioId()));
        a.setFechaAccion(TimeMapper.toLocalDateTimeUtc(auditoria.fechaAccion()));
        a.setAccion(auditoria.accion());
        ticketAuditoriaJpaRepository.save(a);
    }

    @Override
    public List<TicketAuditoria> findAllAuditoria() {
        return ticketAuditoriaJpaRepository.findAllFetched().stream()
                .map(TicketAuditoriaMapper::toDomain).toList();
    }

    @Override
    public List<TicketAuditoria> findAuditoriaByTicketId(Long ticketId) {
        return ticketAuditoriaJpaRepository.findByTicketIdFetched(ticketId).stream()
                .map(TicketAuditoriaMapper::toDomain).toList();
    }
}
