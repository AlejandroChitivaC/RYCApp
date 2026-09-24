package com.rycapp.application.ports.out;

import com.rycapp.domain.model.CostoAdministrativo;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface CostoAdministrativoRepository {
    CostoAdministrativo save(CostoAdministrativo entity);
    Optional<CostoAdministrativo> findById(String id);
    List<CostoAdministrativo> findAll();
    List<CostoAdministrativo> findByFechaInsercionBetween(Instant from, Instant to);
}
