package com.rycapp.application.service;

import com.rycapp.application.exception.ConflictException;
import com.rycapp.application.exception.NotFoundException;
import com.rycapp.application.ports.in.VehiculoUseCase;
import com.rycapp.application.ports.out.VehiculoRepository;
import com.rycapp.domain.model.Vehiculo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VehiculoService implements VehiculoUseCase {
    private static final Logger log = LoggerFactory.getLogger(VehiculoService.class);

    private final VehiculoRepository repository;

    public VehiculoService(VehiculoRepository repository) {
        this.repository = repository;
    }

    @Override
    public Vehiculo crear(String placa, String clase, String marca, String modelo) {
        if (repository.existsByPlacaIgnoreCase(placa)) {
            throw new ConflictException("Ya existe un vehículo con la placa '" + placa + "'.");
        }
        var created = repository.save(new Vehiculo(null, placa, clase, marca, modelo, "ACTIVO"));
        log.info("Vehículo creado id={} placa={}", created.id(), created.placa());
        return created;
    }

    @Override
    public Vehiculo editar(Long id, String placa, String clase, String marca, String modelo) {
        var current = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Vehículo no encontrado (id=" + id + ")."));

        var changedPlate = !current.placa().equalsIgnoreCase(placa);
        if (changedPlate && repository.existsByPlacaIgnoreCase(placa)) {
            throw new ConflictException("Ya existe un vehículo con la placa '" + placa + "'.");
        }

        var updated = repository.save(new Vehiculo(
                current.id(),
                placa,
                clase,
                marca,
                modelo,
                current.estado()
        ));
        log.info("Vehículo actualizado id={}", updated.id());
        return updated;
    }

    @Override
    public List<Vehiculo> listar() {
        return repository.findAll();
    }

    @Override
    public Vehiculo obtener(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Vehículo no encontrado (id=" + id + ")."));
    }
}
