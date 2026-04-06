package com.rycapp.infrastructure.persistence.adapter;

import com.rycapp.application.ports.out.RolRepository;
import com.rycapp.domain.model.Rol;
import com.rycapp.infrastructure.persistence.jpa.mapper.RolMapper;
import com.rycapp.infrastructure.persistence.jpa.repository.RolJpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class RolRepositoryAdapter implements RolRepository {
    private final RolJpaRepository jpaRepository;

    public RolRepositoryAdapter(RolJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public List<Rol> findAll() {
        return jpaRepository.findAll().stream().map(RolMapper::toDomain).toList();
    }

    @Override
    public Optional<Rol> findById(Long id) {
        return jpaRepository.findById(id).map(RolMapper::toDomain);
    }

    @Override
    public Optional<Rol> findByDescripcion(String descripcion) {
        return jpaRepository.findByDescripcion(descripcion).map(RolMapper::toDomain);
    }
}
