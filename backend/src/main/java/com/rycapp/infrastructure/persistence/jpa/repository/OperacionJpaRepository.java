package com.rycapp.infrastructure.persistence.jpa.repository;

import com.rycapp.infrastructure.persistence.jpa.entity.OperacionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OperacionJpaRepository extends JpaRepository<OperacionEntity, Long> {
    @Query("""
            select distinct o from OperacionEntity o
            join fetch o.usuarioRegistro
            join fetch o.lineaNegocio
            join fetch o.vehiculo
            join fetch o.material
            join fetch o.proveedor
            where o.id = :id
            """)
    Optional<OperacionEntity> findOneFetched(@Param("id") Long id);

    @Query("""
            select distinct o from OperacionEntity o
            join fetch o.usuarioRegistro
            join fetch o.lineaNegocio
            join fetch o.vehiculo
            join fetch o.material
            join fetch o.proveedor
            order by o.fechaInsercion desc, o.id desc
            """)
    List<OperacionEntity> findAllFetched();

    @Query("""
            select distinct o from OperacionEntity o
            join fetch o.usuarioRegistro
            join fetch o.lineaNegocio
            join fetch o.vehiculo
            join fetch o.material
            join fetch o.proveedor
            where (:from is null or o.fechaInsercion >= :from)
              and (:to is null or o.fechaInsercion <= :to)
              and (:lineaNegocioId is null or o.lineaNegocio.id = :lineaNegocioId)
              and (:vehiculoId is null or o.vehiculo.id = :vehiculoId)
            order by o.fechaInsercion desc, o.id desc
            """)
    List<OperacionEntity> filterFetched(
            @Param("from") LocalDateTime fromInclusive,
            @Param("to") LocalDateTime toInclusive,
            @Param("lineaNegocioId") Long lineaNegocioId,
            @Param("vehiculoId") Long vehiculoId
    );
}
