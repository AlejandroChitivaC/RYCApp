package com.rycapp.infrastructure.persistence.jpa.repository;

import com.rycapp.infrastructure.persistence.jpa.entity.TicketEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TicketJpaRepository extends JpaRepository<TicketEntity, Long> {

    @Query("""
            select distinct t from TicketEntity t
            join fetch t.operacion
            join fetch t.usuarioCarga
            where t.id = :id
            """)
    Optional<TicketEntity> findOneFetched(@Param("id") Long id);

    @Query("""
            select distinct t from TicketEntity t
            join fetch t.operacion
            join fetch t.usuarioCarga
            order by t.fechaCarga desc, t.id desc
            """)
    List<TicketEntity> findAllFetched();

    @Query("""
            select distinct t from TicketEntity t
            join fetch t.operacion
            join fetch t.usuarioCarga
            where t.operacion.id = :operacionId
            order by t.fechaCarga desc, t.id desc
            """)
    List<TicketEntity> findByOperacionIdFetched(@Param("operacionId") Long operacionId);

    boolean existsByHashSha256(String hashSha256);

    boolean existsByNumeroTicket(String numeroTicket);
}
