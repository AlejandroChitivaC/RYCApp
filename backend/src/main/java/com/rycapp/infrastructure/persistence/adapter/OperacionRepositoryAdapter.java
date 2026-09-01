package com.rycapp.infrastructure.persistence.adapter;

import com.rycapp.application.ports.out.OperacionRepository;
import com.rycapp.domain.model.Operacion;
import com.rycapp.infrastructure.persistence.jpa.entity.OperacionEntity;
import com.rycapp.infrastructure.persistence.jpa.mapper.OperacionMapper;
import com.rycapp.infrastructure.persistence.jpa.mapper.TimeMapper;
import com.rycapp.infrastructure.persistence.jpa.repository.LineaNegocioJpaRepository;
import com.rycapp.infrastructure.persistence.jpa.repository.MaterialJpaRepository;
import com.rycapp.infrastructure.persistence.jpa.repository.OperacionJpaRepository;
import com.rycapp.infrastructure.persistence.jpa.repository.ProveedorJpaRepository;
import com.rycapp.infrastructure.persistence.jpa.repository.UsuarioJpaRepository;
import com.rycapp.infrastructure.persistence.jpa.repository.VehiculoJpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public class OperacionRepositoryAdapter implements OperacionRepository {
    private final OperacionJpaRepository operacionJpaRepository;
    private final UsuarioJpaRepository usuarioJpaRepository;
    private final LineaNegocioJpaRepository lineaNegocioJpaRepository;
    private final VehiculoJpaRepository vehiculoJpaRepository;
    private final MaterialJpaRepository materialJpaRepository;
    private final ProveedorJpaRepository proveedorJpaRepository;

    public OperacionRepositoryAdapter(
            OperacionJpaRepository operacionJpaRepository,
            UsuarioJpaRepository usuarioJpaRepository,
            LineaNegocioJpaRepository lineaNegocioJpaRepository,
            VehiculoJpaRepository vehiculoJpaRepository,
            MaterialJpaRepository materialJpaRepository,
            ProveedorJpaRepository proveedorJpaRepository
    ) {
        this.operacionJpaRepository = operacionJpaRepository;
        this.usuarioJpaRepository = usuarioJpaRepository;
        this.lineaNegocioJpaRepository = lineaNegocioJpaRepository;
        this.vehiculoJpaRepository = vehiculoJpaRepository;
        this.materialJpaRepository = materialJpaRepository;
        this.proveedorJpaRepository = proveedorJpaRepository;
    }

    @Override
    public Operacion save(Operacion operacion) {
        OperacionEntity e = operacion.id() != null
                ? operacionJpaRepository.findById(operacion.id()).orElseGet(OperacionEntity::new)
                : new OperacionEntity();
        if (operacion.id() != null) {
            e.setId(operacion.id());
        }
        e.setUsuarioRegistro(usuarioJpaRepository.getReferenceById(operacion.usuarioRegistroId()));
        e.setLineaNegocio(lineaNegocioJpaRepository.getReferenceById(operacion.lineaNegocioId()));
        e.setVehiculo(vehiculoJpaRepository.getReferenceById(operacion.vehiculoId()));
        e.setMaterial(materialJpaRepository.getReferenceById(operacion.materialId()));
        e.setProveedor(proveedorJpaRepository.getReferenceById(operacion.proveedorId()));
        e.setFechaInsercion(TimeMapper.toLocalDateTimeUtc(operacion.fechaInsercion()));
        e.setFechaInicio(operacion.fechaInicio() != null ? TimeMapper.toLocalDateTimeUtc(operacion.fechaInicio()) : null);
        e.setFechaFin(operacion.fechaFin() != null ? TimeMapper.toLocalDateTimeUtc(operacion.fechaFin()) : null);
        e.setMedioPago(operacion.medioPago());
        e.setValor(operacion.valor());
        e.setDescripcion(operacion.descripcion());
        e.setEstado(operacion.estado() != null ? operacion.estado() : com.rycapp.domain.model.OperacionEstados.REGISTRADA);

        var saved = operacionJpaRepository.save(e);
        return operacionJpaRepository.findOneFetched(saved.getId()).map(OperacionMapper::toDomain).orElseThrow();
    }

    @Override
    public Optional<Operacion> findById(Long id) {
        return operacionJpaRepository.findOneFetched(id).map(OperacionMapper::toDomain);
    }

    @Override
    public List<Operacion> findAll() {
        return operacionJpaRepository.findAllFetched().stream().map(OperacionMapper::toDomain).toList();
    }

    @Override
    public List<Operacion> findByEstado(String estado) {
        return operacionJpaRepository.findByEstadoFetched(estado).stream().map(OperacionMapper::toDomain).toList();
    }

    @Override
    public List<Operacion> filter(
            Instant fromInclusive,
            Instant toInclusive,
            Long lineaNegocioId,
            Long vehiculoId,
            Long proveedorId
    ) {
        var from = TimeMapper.toLocalDateTimeUtc(fromInclusive);
        var to = TimeMapper.toLocalDateTimeUtc(toInclusive);
        return operacionJpaRepository.filterFetched(from, to, lineaNegocioId, vehiculoId, proveedorId).stream()
                .map(OperacionMapper::toDomain)
                .toList();
    }
}
