package com.rycapp.infrastructure.persistence.jpa.repository;

import com.rycapp.infrastructure.persistence.jpa.entity.LineaNegocioEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LineaNegocioJpaRepository extends JpaRepository<LineaNegocioEntity, Long> {
    boolean existsByLineaNegocioIgnoreCase(String lineaNegocio);
}
