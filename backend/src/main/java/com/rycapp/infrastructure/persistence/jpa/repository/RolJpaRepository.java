package com.rycapp.infrastructure.persistence.jpa.repository;

import com.rycapp.infrastructure.persistence.jpa.entity.RolEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RolJpaRepository extends JpaRepository<RolEntity, Long> {
    Optional<RolEntity> findByDescripcion(String descripcion);
}
