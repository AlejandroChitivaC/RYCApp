package com.rycapp.infrastructure.persistence.jpa.repository;

import com.rycapp.infrastructure.persistence.jpa.entity.CostoAdministrativoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CostoAdministrativoJpaRepository extends JpaRepository<CostoAdministrativoEntity, Long> {
    @Query("""
            select c from CostoAdministrativoEntity c
            join fetch c.usuarioRegistro join fetch c.tipoCosto
            where c.id = :id
            """)
    Optional<CostoAdministrativoEntity> findOneFetched(@Param("id") Long id);

    @Query("""
            select c from CostoAdministrativoEntity c
            join fetch c.usuarioRegistro join fetch c.tipoCosto
            order by c.fechaInsercion desc, c.id desc
            """)
    List<CostoAdministrativoEntity> findAllFetched();
}
