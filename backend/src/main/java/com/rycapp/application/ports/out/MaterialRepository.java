package com.rycapp.application.ports.out;

import com.rycapp.domain.model.Material;

import java.util.List;
import java.util.Optional;

public interface MaterialRepository {
    Material save(Material material);
    Optional<Material> findById(String id);
    List<Material> findAll();
    boolean existsByMaterialIgnoreCase(String material);
}
