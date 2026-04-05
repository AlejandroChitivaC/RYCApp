package com.rycapp.infrastructure.persistence.adapter;

import com.rycapp.application.ports.out.ProveedorRepository;
import com.rycapp.domain.model.Proveedor;
import com.rycapp.infrastructure.persistence.jpa.mapper.ProveedorMapper;
import com.rycapp.infrastructure.persistence.jpa.repository.ProveedorJpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class ProveedorRepositoryAdapter implements ProveedorRepository {
    private final ProveedorJpaRepository jpaRepository;

    public ProveedorRepositoryAdapter(ProveedorJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public Proveedor save(Proveedor proveedor) {
        return ProveedorMapper.toDomain(jpaRepository.save(ProveedorMapper.toEntity(proveedor)));
    }

    @Override
    public Optional<Proveedor> findById(Long id) {
        return jpaRepository.findById(id).map(ProveedorMapper::toDomain);
    }

    @Override
    public List<Proveedor> findAll() {
        return jpaRepository.findAll().stream().map(ProveedorMapper::toDomain).toList();
    }

    @Override
    public boolean existsByNitIgnoreCase(String nit) {
        return jpaRepository.existsByNitIgnoreCase(nit);
    }
}
