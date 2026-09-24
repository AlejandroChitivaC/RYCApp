package com.rycapp.infrastructure.persistence.jpa.repository;

import com.rycapp.infrastructure.persistence.jpa.entity.MaterialEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MaterialJpaRepository extends JpaRepository<MaterialEntity, Long> {
    boolean existsByMaterialIgnoreCase(String material);
}
