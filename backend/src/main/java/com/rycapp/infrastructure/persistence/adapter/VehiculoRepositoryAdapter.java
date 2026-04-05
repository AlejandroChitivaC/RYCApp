package com.rycapp.infrastructure.persistence.adapter;

import com.rycapp.application.ports.out.VehiculoRepository;
import com.rycapp.domain.model.Vehiculo;
import com.rycapp.infrastructure.persistence.jpa.mapper.VehiculoMapper;
import com.rycapp.infrastructure.persistence.jpa.repository.VehiculoJpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class VehiculoRepositoryAdapter implements VehiculoRepository {
    private final VehiculoJpaRepository jpaRepository;

    public VehiculoRepositoryAdapter(VehiculoJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public Vehiculo save(Vehiculo vehiculo) {
        var saved = jpaRepository.save(VehiculoMapper.toEntity(vehiculo));
        return VehiculoMapper.toDomain(saved);
    }

    @Override
    public Optional<Vehiculo> findById(Long id) {
        return jpaRepository.findById(id).map(VehiculoMapper::toDomain);
    }

    @Override
    public List<Vehiculo> findAll() {
        return jpaRepository.findAll().stream().map(VehiculoMapper::toDomain).toList();
    }

    @Override
    public boolean existsByPlacaIgnoreCase(String placa) {
        return jpaRepository.existsByPlacaIgnoreCase(placa);
    }
}

