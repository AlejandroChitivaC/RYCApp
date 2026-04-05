package com.rycapp.application.service;

import com.rycapp.application.exception.NotFoundException;
import com.rycapp.application.ports.in.MaterialUseCase;
import com.rycapp.application.ports.out.MaterialRepository;
import com.rycapp.domain.model.Material;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MaterialService implements MaterialUseCase {
    private static final Logger log = LoggerFactory.getLogger(MaterialService.class);

    private final MaterialRepository repository;

    public MaterialService(MaterialRepository repository) {
        this.repository = repository;
    }

    @Override
    public Material crear(String material, String descripcion) {
        var created = repository.save(new Material(null, material, descripcion));
        log.info("Material creado id={}", created.id());
        return created;
    }

    @Override
    public Material editar(Long id, String material, String descripcion) {
        repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Material no encontrado (id=" + id + ")."));
        var updated = repository.save(new Material(id, material, descripcion));
        log.info("Material actualizado id={}", updated.id());
        return updated;
    }

    @Override
    public List<Material> listar() {
        return repository.findAll();
    }

    @Override
    public Material obtener(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Material no encontrado (id=" + id + ")."));
    }
}
