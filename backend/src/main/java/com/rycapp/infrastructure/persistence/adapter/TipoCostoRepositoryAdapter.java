package com.rycapp.infrastructure.persistence.adapter;

import com.rycapp.application.ports.out.TipoCostoRepository;
import com.rycapp.domain.model.TipoCosto;
import com.rycapp.infrastructure.persistence.jpa.mapper.TipoCostoMapper;
import com.rycapp.infrastructure.persistence.jpa.repository.TipoCostoJpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class TipoCostoRepositoryAdapter implements TipoCostoRepository {
    private final TipoCostoJpaRepository jpaRepository;

    public TipoCostoRepositoryAdapter(TipoCostoJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public TipoCosto save(TipoCosto tipoCosto) {
        return TipoCostoMapper.toDomain(jpaRepository.save(TipoCostoMapper.toEntity(tipoCosto)));
    }

    @Override
    public Optional<TipoCosto> findById(Long id) {
        return jpaRepository.findById(id).map(TipoCostoMapper::toDomain);
    }

    @Override
    public List<TipoCosto> findAll() {
        return jpaRepository.findAll().stream().map(TipoCostoMapper::toDomain).toList();
    }
}
