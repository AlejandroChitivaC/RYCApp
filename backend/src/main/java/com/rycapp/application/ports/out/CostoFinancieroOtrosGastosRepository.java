package com.rycapp.application.ports.out;

import com.rycapp.domain.model.CostoFinancieroOtrosGastos;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface CostoFinancieroOtrosGastosRepository {
    CostoFinancieroOtrosGastos save(CostoFinancieroOtrosGastos entity);
    Optional<CostoFinancieroOtrosGastos> findById(String id);
    List<CostoFinancieroOtrosGastos> findAll();
    List<CostoFinancieroOtrosGastos> findByFechaInsercionBetween(Instant from, Instant to);
}
