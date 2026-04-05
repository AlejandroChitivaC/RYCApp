package com.rycapp.infrastructure.persistence.adapter;

import com.rycapp.application.ports.out.LineaNegocioRepository;
import com.rycapp.domain.model.LineaNegocio;
import com.rycapp.infrastructure.persistence.jpa.mapper.LineaNegocioMapper;
import com.rycapp.infrastructure.persistence.jpa.repository.LineaNegocioJpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class LineaNegocioRepositoryAdapter implements LineaNegocioRepository {
    private final LineaNegocioJpaRepository jpaRepository;

    public LineaNegocioRepositoryAdapter(LineaNegocioJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public LineaNegocio save(LineaNegocio lineaNegocio) {
        var saved = jpaRepository.save(LineaNegocioMapper.toEntity(lineaNegocio));
        return LineaNegocioMapper.toDomain(saved);
    }

    @Override
    public Optional<LineaNegocio> findById(Long id) {
        return jpaRepository.findById(id).map(LineaNegocioMapper::toDomain);
    }

    @Override
    public List<LineaNegocio> findAll() {
        return jpaRepository.findAll().stream().map(LineaNegocioMapper::toDomain).toList();
    }

    @Override
    public boolean existsByLineaNegocioIgnoreCase(String lineaNegocio) {
        return jpaRepository.existsByLineaNegocioIgnoreCase(lineaNegocio);
    }
}
