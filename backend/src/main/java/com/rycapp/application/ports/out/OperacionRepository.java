package com.rycapp.application.ports.out;

import com.rycapp.domain.model.Operacion;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface OperacionRepository {
    Operacion save(Operacion operacion);
    Optional<Operacion> findById(Long id);
    List<Operacion> findAll();
    List<Operacion> filter(Instant fromInclusive, Instant toInclusive, Long lineaNegocioId, Long vehiculoId);
}
