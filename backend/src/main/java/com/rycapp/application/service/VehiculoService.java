package com.rycapp.application.service;

import com.rycapp.application.exception.ConflictException;
import com.rycapp.application.exception.NotFoundException;
import com.rycapp.application.ports.in.VehiculoUseCase;
import com.rycapp.application.ports.out.UsuarioRepository;
import com.rycapp.application.ports.out.VehiculoRepository;
import com.rycapp.domain.model.Vehiculo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VehiculoService implements VehiculoUseCase {
    private static final Logger log = LoggerFactory.getLogger(VehiculoService.class);
    private static final String ROL_CONDUCTOR = "Conductor";

    private final VehiculoRepository repository;
    private final UsuarioRepository usuarioRepository;

    public VehiculoService(VehiculoRepository repository, UsuarioRepository usuarioRepository) {
        this.repository = repository;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public Vehiculo crear(String placa, String clase, String marca, String modelo, Long conductorId) {
        if (repository.existsByPlacaIgnoreCase(placa)) {
            throw new ConflictException("Ya existe un vehículo con la placa '" + placa + "'.");
        }
        validarConductor(conductorId, null);
        var created = repository.save(new Vehiculo(null, placa, clase, marca, modelo, "ACTIVO", conductorId));
        log.info("Vehículo creado id={} placa={}", created.id(), created.placa());
        return created;
    }

    @Override
    public Vehiculo editar(Long id, String placa, String clase, String marca, String modelo, Long conductorId) {
        var current = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Vehículo no encontrado (id=" + id + ")."));

        var changedPlate = !current.placa().equalsIgnoreCase(placa);
        if (changedPlate && repository.existsByPlacaIgnoreCase(placa)) {
            throw new ConflictException("Ya existe un vehículo con la placa '" + placa + "'.");
        }

        validarConductor(conductorId, id);

        var updated = repository.save(new Vehiculo(
                current.id(),
                placa,
                clase,
                marca,
                modelo,
                current.estado(),
                conductorId
        ));
        log.info("Vehículo actualizado id={}", updated.id());
        return updated;
    }

    @Override
    public Vehiculo cambiarEstado(Long id, String estado) {
        var current = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Vehículo no encontrado (id=" + id + ")."));
        var normalizado = estado == null ? "" : estado.trim().toUpperCase();
        if (!normalizado.equals("ACTIVO") && !normalizado.equals("INACTIVO")) {
            throw new IllegalArgumentException("El estado debe ser ACTIVO o INACTIVO.");
        }
        var conductorId = normalizado.equals("INACTIVO") ? null : current.conductorId();
        var updated = repository.save(new Vehiculo(
                current.id(),
                current.placa(),
                current.clase(),
                current.marca(),
                current.modelo(),
                normalizado,
                conductorId
        ));
        log.info("Vehículo estado cambiado id={} estado={} conductorId={}",
                updated.id(), updated.estado(), updated.conductorId());
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

    private void validarConductor(Long conductorId, Long excluirVehiculoId) {
        if (conductorId == null) {
            throw new IllegalArgumentException("El vehículo debe tener un conductor asignado.");
        }
        usuarioRepository.findById(conductorId)
                .orElseThrow(() -> new NotFoundException("Conductor no encontrado (id=" + conductorId + ")."));
        if (!usuarioRepository.tieneRolDescripcion(conductorId, ROL_CONDUCTOR)) {
            throw new ConflictException("El usuario asignado debe tener rol Conductor.");
        }
        if (repository.conductorAsignadoOtroVehiculo(conductorId, excluirVehiculoId)) {
            throw new ConflictException("Ese conductor ya está asignado a otro vehículo.");
        }
    }
}
