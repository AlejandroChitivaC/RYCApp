package com.rycapp.application.service;

import com.rycapp.application.exception.NotFoundException;
import com.rycapp.application.ports.in.OperacionUseCase;
import com.rycapp.application.ports.out.LineaNegocioRepository;
import com.rycapp.application.ports.out.MaterialRepository;
import com.rycapp.application.ports.out.OperacionRepository;
import com.rycapp.application.ports.out.ProveedorRepository;
import com.rycapp.application.ports.out.UsuarioRepository;
import com.rycapp.application.ports.out.VehiculoRepository;
import com.rycapp.domain.model.Operacion;
import com.rycapp.domain.model.OperacionEstados;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Service
public class OperacionService implements OperacionUseCase {
    private static final Logger log = LoggerFactory.getLogger(OperacionService.class);

    private final OperacionRepository operacionRepository;
    private final UsuarioRepository usuarioRepository;
    private final LineaNegocioRepository lineaNegocioRepository;
    private final VehiculoRepository vehiculoRepository;
    private final MaterialRepository materialRepository;
    private final ProveedorRepository proveedorRepository;

    public OperacionService(
            OperacionRepository operacionRepository,
            UsuarioRepository usuarioRepository,
            LineaNegocioRepository lineaNegocioRepository,
            VehiculoRepository vehiculoRepository,
            MaterialRepository materialRepository,
            ProveedorRepository proveedorRepository
    ) {
        this.operacionRepository = operacionRepository;
        this.usuarioRepository = usuarioRepository;
        this.lineaNegocioRepository = lineaNegocioRepository;
        this.vehiculoRepository = vehiculoRepository;
        this.materialRepository = materialRepository;
        this.proveedorRepository = proveedorRepository;
    }

    @Override
    public Operacion crear(
            Long usuarioRegistroId,
            Long lineaNegocioId,
            Long vehiculoId,
            Long materialId,
            Long proveedorId,
            Instant fechaInicio,
            Instant fechaFin,
            String medioPago,
            BigDecimal valor,
            String descripcion
    ) {
        usuarioRepository.findById(usuarioRegistroId)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado (id=" + usuarioRegistroId + ")."));
        var linea = lineaNegocioRepository.findById(lineaNegocioId)
                .orElseThrow(() -> new NotFoundException("Línea de negocio no encontrada (id=" + lineaNegocioId + ")."));
        if (!esActivo(linea.estado())) {
            throw new IllegalArgumentException("La línea de negocio está inactiva y no puede usarse en una operación.");
        }
        var vehiculo = vehiculoRepository.findById(vehiculoId)
                .orElseThrow(() -> new NotFoundException("Vehículo no encontrado (id=" + vehiculoId + ")."));
        if (!esActivo(vehiculo.estado())) {
            throw new IllegalArgumentException("El vehículo está inactivo y no puede usarse en una operación.");
        }
        if (vehiculo.conductorId() == null) {
            throw new IllegalArgumentException("El vehículo debe tener un conductor asignado.");
        }
        materialRepository.findById(materialId)
                .orElseThrow(() -> new NotFoundException("Material no encontrado (id=" + materialId + ")."));
        var proveedor = proveedorRepository.findById(proveedorId)
                .orElseThrow(() -> new NotFoundException("Proveedor no encontrado (id=" + proveedorId + ")."));
        if (!esActivo(proveedor.estado())) {
            throw new IllegalArgumentException("El proveedor está inactivo y no puede usarse en una operación.");
        }

        if (fechaInicio == null || fechaFin == null) {
            throw new IllegalArgumentException("Las fechas de inicio y fin son obligatorias.");
        }
        if (fechaInicio.isAfter(fechaFin)) {
            throw new IllegalArgumentException("La fecha de inicio no puede ser posterior a la fecha fin.");
        }

        var now = Instant.now();
        var created = operacionRepository.save(new Operacion(
                null,
                usuarioRegistroId,
                lineaNegocioId,
                vehiculoId,
                materialId,
                proveedorId,
                now,
                fechaInicio,
                fechaFin,
                medioPago,
                valor,
                descripcion,
                OperacionEstados.REGISTRADA
        ));
        log.info("Operación creada id={} lineaNegocioId={}", created.id(), created.lineaNegocioId());
        return created;
    }

    @Override
    public Operacion obtener(Long id) {
        return operacionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Operación no encontrada (id=" + id + ")."));
    }

    @Override
    public List<Operacion> listar() {
        return operacionRepository.findAll();
    }

    @Override
    public List<Operacion> filtrar(
            Instant fromInclusive,
            Instant toInclusive,
            Long lineaNegocioId,
            Long vehiculoId,
            Long proveedorId
    ) {
        return operacionRepository.filter(fromInclusive, toInclusive, lineaNegocioId, vehiculoId, proveedorId);
    }

    @Override
    public Operacion confirmar(Long id) {
        var actual = obtener(id);
        if (OperacionEstados.esConfirmada(actual.estado())) {
            return actual;
        }
        var confirmada = operacionRepository.save(new Operacion(
                actual.id(),
                actual.usuarioRegistroId(),
                actual.lineaNegocioId(),
                actual.vehiculoId(),
                actual.materialId(),
                actual.proveedorId(),
                actual.fechaInsercion(),
                actual.fechaInicio(),
                actual.fechaFin(),
                actual.medioPago(),
                actual.valor(),
                actual.descripcion(),
                OperacionEstados.CONFIRMADA
        ));
        log.info("Operación confirmada id={}", confirmada.id());
        return confirmada;
    }

    private static boolean esActivo(String estado) {
        return estado != null && estado.equalsIgnoreCase("ACTIVO");
    }
}
