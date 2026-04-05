package com.rycapp.infrastructure.persistence.adapter;

import com.rycapp.application.ports.out.MaterialRepository;
import com.rycapp.domain.model.Material;
import com.rycapp.infrastructure.persistence.jpa.mapper.MaterialMapper;
import com.rycapp.infrastructure.persistence.jpa.repository.MaterialJpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class MaterialRepositoryAdapter implements MaterialRepository {
    private final MaterialJpaRepository jpaRepository;

    public MaterialRepositoryAdapter(MaterialJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public Material save(Material material) {
        return MaterialMapper.toDomain(jpaRepository.save(MaterialMapper.toEntity(material)));
    }

    @Override
    public Optional<Material> findById(Long id) {
        return jpaRepository.findById(id).map(MaterialMapper::toDomain);
    }

    @Override
    public List<Material> findAll() {
        return jpaRepository.findAll().stream().map(MaterialMapper::toDomain).toList();
    }
}
