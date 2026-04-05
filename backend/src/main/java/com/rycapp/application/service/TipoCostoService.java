package com.rycapp.application.service;

import com.rycapp.application.exception.NotFoundException;
import com.rycapp.application.ports.in.TipoCostoUseCase;
import com.rycapp.application.ports.out.TipoCostoRepository;
import com.rycapp.domain.model.TipoCosto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TipoCostoService implements TipoCostoUseCase {
    private static final Logger log = LoggerFactory.getLogger(TipoCostoService.class);

    private final TipoCostoRepository repository;

    public TipoCostoService(TipoCostoRepository repository) {
        this.repository = repository;
    }

    @Override
    public TipoCosto crear(String tipoCosto, String flujo, String descripcion) {
        var created = repository.save(new TipoCosto(null, tipoCosto, flujo, descripcion, "ACTIVO"));
        log.info("Tipo de costo creado id={}", created.id());
        return created;
    }

    @Override
    public TipoCosto editar(Long id, String tipoCosto, String flujo, String descripcion, String estado) {
        repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Tipo de costo no encontrado (id=" + id + ")."));
        var updated = repository.save(new TipoCosto(id, tipoCosto, flujo, descripcion, estado));
        log.info("Tipo de costo actualizado id={}", updated.id());
        return updated;
    }

    @Override
    public List<TipoCosto> listar() {
        return repository.findAll();
    }

    @Override
    public TipoCosto obtener(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Tipo de costo no encontrado (id=" + id + ")."));
    }
}
