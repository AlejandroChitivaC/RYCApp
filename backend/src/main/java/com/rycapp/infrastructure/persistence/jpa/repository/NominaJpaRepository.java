package com.rycapp.infrastructure.persistence.jpa.repository;

import com.rycapp.infrastructure.persistence.jpa.entity.NominaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface NominaJpaRepository extends JpaRepository<NominaEntity, Long> {
    @Query("""
            select n from NominaEntity n
            join fetch n.usuarioRegistro join fetch n.tipoCosto join fetch n.usuarioDebitado
            where n.id = :id
            """)
    Optional<NominaEntity> findOneFetched(@Param("id") Long id);

    @Query("""
            select n from NominaEntity n
            join fetch n.usuarioRegistro join fetch n.tipoCosto join fetch n.usuarioDebitado
            order by n.fechaInsercion desc, n.id desc
            """)
    List<NominaEntity> findAllFetched();
}
