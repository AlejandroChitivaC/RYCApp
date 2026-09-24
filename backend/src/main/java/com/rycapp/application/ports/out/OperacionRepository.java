package com.rycapp.application.ports.out;

import com.rycapp.domain.model.Operacion;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface OperacionRepository {
    Operacion save(Operacion operacion);
    Optional<Operacion> findById(String id);
    List<Operacion> findAll();
    List<Operacion> findByEstado(String estado);
    List<Operacion> filter(
            Instant fromInclusive,
            Instant toInclusive,
            String lineaNegocioId,
            String vehiculoId,
            String proveedorId
    );
}
