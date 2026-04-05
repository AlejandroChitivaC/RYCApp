package com.rycapp.infrastructure.persistence.jpa.repository;

import com.rycapp.infrastructure.persistence.jpa.entity.CostoVehiculoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CostoVehiculoJpaRepository extends JpaRepository<CostoVehiculoEntity, Long> {
    @Query("""
            select c from CostoVehiculoEntity c
            join fetch c.usuarioRegistro join fetch c.tipoCosto join fetch c.vehiculo
            where c.id = :id
            """)
    Optional<CostoVehiculoEntity> findOneFetched(@Param("id") Long id);

    @Query("""
            select c from CostoVehiculoEntity c
            join fetch c.usuarioRegistro join fetch c.tipoCosto join fetch c.vehiculo
            order by c.fechaInsercion desc, c.id desc
            """)
    List<CostoVehiculoEntity> findAllFetched();
}
