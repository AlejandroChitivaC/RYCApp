package com.rycapp.infrastructure.persistence.jpa.repository;

import com.rycapp.infrastructure.persistence.jpa.entity.VehiculoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VehiculoJpaRepository extends JpaRepository<VehiculoEntity, Long> {
    boolean existsByPlacaIgnoreCase(String placa);
}

