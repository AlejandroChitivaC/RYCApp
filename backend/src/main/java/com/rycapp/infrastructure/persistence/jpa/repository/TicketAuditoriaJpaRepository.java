package com.rycapp.infrastructure.persistence.jpa.repository;

import com.rycapp.infrastructure.persistence.jpa.entity.TicketAuditoriaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TicketAuditoriaJpaRepository extends JpaRepository<TicketAuditoriaEntity, Long> {

    @Query("""
            select distinct a from TicketAuditoriaEntity a
            join fetch a.ticket
            join fetch a.usuario
            order by a.fechaAccion asc, a.id asc
            """)
    List<TicketAuditoriaEntity> findAllFetched();

    @Query("""
            select distinct a from TicketAuditoriaEntity a
            join fetch a.ticket
            join fetch a.usuario
            where a.ticket.id = :ticketId
            order by a.fechaAccion asc, a.id asc
            """)
    List<TicketAuditoriaEntity> findByTicketIdFetched(@Param("ticketId") Long ticketId);
}
