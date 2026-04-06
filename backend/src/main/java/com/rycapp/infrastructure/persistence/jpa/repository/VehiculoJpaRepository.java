package com.rycapp.infrastructure.persistence.jpa.repository;

import com.rycapp.infrastructure.persistence.jpa.entity.VehiculoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface VehiculoJpaRepository extends JpaRepository<VehiculoEntity, Long> {
    boolean existsByPlacaIgnoreCase(String placa);

    boolean existsByConductor_Id(Long conductorId);

    boolean existsByConductor_IdAndIdNot(Long conductorId, Long vehiculoId);

    @Query("select v from VehiculoEntity v left join fetch v.conductor where v.id = :id")
    Optional<VehiculoEntity> findOneWithConductor(@Param("id") Long id);

    @Query("select distinct v from VehiculoEntity v left join fetch v.conductor order by v.id desc")
    List<VehiculoEntity> findAllWithConductor();
}

