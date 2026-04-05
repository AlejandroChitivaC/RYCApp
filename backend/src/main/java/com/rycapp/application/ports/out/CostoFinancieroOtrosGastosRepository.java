package com.rycapp.application.ports.out;

import com.rycapp.domain.model.CostoFinancieroOtrosGastos;

import java.util.List;
import java.util.Optional;

public interface CostoFinancieroOtrosGastosRepository {
    CostoFinancieroOtrosGastos save(CostoFinancieroOtrosGastos entity);
    Optional<CostoFinancieroOtrosGastos> findById(Long id);
    List<CostoFinancieroOtrosGastos> findAll();
}
