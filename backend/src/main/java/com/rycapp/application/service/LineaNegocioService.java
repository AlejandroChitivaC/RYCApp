package com.rycapp.application.service;

import com.rycapp.application.exception.ConflictException;
import com.rycapp.application.exception.NotFoundException;
import com.rycapp.application.ports.in.LineaNegocioUseCase;
import com.rycapp.application.ports.out.LineaNegocioRepository;
import com.rycapp.domain.model.LineaNegocio;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LineaNegocioService implements LineaNegocioUseCase {
    private static final Logger log = LoggerFactory.getLogger(LineaNegocioService.class);

    private final LineaNegocioRepository repository;

    public LineaNegocioService(LineaNegocioRepository repository) {
        this.repository = repository;
    }

    @Override
    public LineaNegocio crear(String lineaNegocio, String descripcion) {
        if (repository.existsByLineaNegocioIgnoreCase(lineaNegocio)) {
            throw new ConflictException("Ya existe una línea de negocio con el nombre '" + lineaNegocio + "'.");
        }
        var created = repository.save(new LineaNegocio(null, lineaNegocio, descripcion, "ACTIVO"));
        log.info("Línea de negocio creada id={} lineaNegocio={}", created.id(), created.lineaNegocio());
        return created;
    }

    @Override
    public LineaNegocio editar(String id, String lineaNegocio, String descripcion) {
        var current = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Línea de negocio no encontrada (id=" + id + ")."));

        var renamed = !current.lineaNegocio().equalsIgnoreCase(lineaNegocio);
        if (renamed && repository.existsByLineaNegocioIgnoreCase(lineaNegocio)) {
            throw new ConflictException("Ya existe una línea de negocio con el nombre '" + lineaNegocio + "'.");
        }

        var updated = repository.save(new LineaNegocio(
                current.id(),
                lineaNegocio,
                descripcion,
                current.estado()
        ));
        log.info("Línea de negocio actualizada id={}", updated.id());
        return updated;
    }

    @Override
    public List<LineaNegocio> listar() {
        return repository.findAll();
    }

    @Override
    public LineaNegocio cambiarEstado(String id, String estado) {
        var current = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Línea de negocio no encontrada (id=" + id + ")."));

        var updated = repository.save(new LineaNegocio(
                current.id(),
                current.lineaNegocio(),
                current.descripcion(),
                estado
        ));
        log.info("Línea de negocio estado cambiado id={} estado={}", updated.id(), updated.estado());
        return updated;
    }

    @Override
    public LineaNegocio obtener(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Línea de negocio no encontrada (id=" + id + ")."));
    }
}
