package com.rycapp.application.ports.out;

import com.rycapp.domain.model.Nomina;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface NominaRepository {
    Nomina save(Nomina entity);
    Optional<Nomina> findById(String id);
    List<Nomina> findAll();
    List<Nomina> findByFechaInsercionBetween(Instant from, Instant to);
}
