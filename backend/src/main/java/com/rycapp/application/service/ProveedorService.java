package com.rycapp.application.service;

import com.rycapp.application.exception.ConflictException;
import com.rycapp.application.exception.NotFoundException;
import com.rycapp.application.ports.in.ProveedorUseCase;
import com.rycapp.application.ports.out.ProveedorRepository;
import com.rycapp.domain.model.Proveedor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProveedorService implements ProveedorUseCase {
    private static final Logger log = LoggerFactory.getLogger(ProveedorService.class);

    private final ProveedorRepository repository;

    public ProveedorService(ProveedorRepository repository) {
        this.repository = repository;
    }

    @Override
    public Proveedor crear(String nombre, String nit, String departamento, String municipio, String descripcion) {
        if (repository.existsByNitIgnoreCase(nit)) {
            throw new ConflictException("Ya existe un proveedor con el NIT '" + nit + "'.");
        }
        var created = repository.save(new Proveedor(null, nombre, nit, departamento, municipio, descripcion, "ACTIVO"));
        log.info("Proveedor creado id={}", created.id());
        return created;
    }

    @Override
    public Proveedor editar(String id, String nombre, String nit, String departamento, String municipio, String descripcion) {
        var current = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Proveedor no encontrado (id=" + id + ")."));
        var nitChanged = !current.nit().equalsIgnoreCase(nit);
        if (nitChanged && repository.existsByNitIgnoreCase(nit)) {
            throw new ConflictException("Ya existe un proveedor con el NIT '" + nit + "'.");
        }
        var updated = repository.save(new Proveedor(
                id, nombre, nit, departamento, municipio, descripcion, current.estado()));
        log.info("Proveedor actualizado id={}", updated.id());
        return updated;
    }

    @Override
    public Proveedor cambiarEstado(String id, String estado) {
        var current = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Proveedor no encontrado (id=" + id + ")."));
        var normalizado = normalizarEstado(estado);
        var updated = repository.save(new Proveedor(
                current.id(),
                current.nombre(),
                current.nit(),
                current.departamento(),
                current.municipio(),
                current.descripcion(),
                normalizado
        ));
        log.info("Proveedor estado cambiado id={} estado={}", updated.id(), updated.estado());
        return updated;
    }

    @Override
    public List<Proveedor> listar() {
        return repository.findAll();
    }

    @Override
    public Proveedor obtener(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Proveedor no encontrado (id=" + id + ")."));
    }

    private static String normalizarEstado(String estado) {
        var n = estado == null ? "" : estado.trim().toUpperCase();
        if (!n.equals("ACTIVO") && !n.equals("INACTIVO")) {
            throw new IllegalArgumentException("El estado debe ser ACTIVO o INACTIVO.");
        }
        return n;
    }
}
