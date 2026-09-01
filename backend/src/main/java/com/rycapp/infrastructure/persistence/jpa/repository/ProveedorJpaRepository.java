package com.rycapp.infrastructure.persistence.jpa.repository;

import com.rycapp.infrastructure.persistence.jpa.entity.ProveedorEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProveedorJpaRepository extends JpaRepository<ProveedorEntity, Long> {
    boolean existsByNitIgnoreCase(String nit);

    Optional<ProveedorEntity> findByNitIgnoreCase(String nit);
}
