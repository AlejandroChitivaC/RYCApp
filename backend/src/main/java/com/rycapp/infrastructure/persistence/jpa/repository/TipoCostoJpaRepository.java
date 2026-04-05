package com.rycapp.infrastructure.persistence.jpa.repository;

import com.rycapp.infrastructure.persistence.jpa.entity.TipoCostoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TipoCostoJpaRepository extends JpaRepository<TipoCostoEntity, Long> {}
