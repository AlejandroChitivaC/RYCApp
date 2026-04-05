package com.rycapp.infrastructure.persistence.jpa.repository;

import com.rycapp.infrastructure.persistence.jpa.entity.CostoFinancieroOtrosGastosEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CostoFinancieroOtrosGastosJpaRepository extends JpaRepository<CostoFinancieroOtrosGastosEntity, Long> {
    @Query("""
            select c from CostoFinancieroOtrosGastosEntity c
            join fetch c.usuarioRegistro join fetch c.tipoCosto
            where c.id = :id
            """)
    Optional<CostoFinancieroOtrosGastosEntity> findOneFetched(@Param("id") Long id);

    @Query("""
            select c from CostoFinancieroOtrosGastosEntity c
            join fetch c.usuarioRegistro join fetch c.tipoCosto
            order by c.fechaInsercion desc, c.id desc
            """)
    List<CostoFinancieroOtrosGastosEntity> findAllFetched();
}
