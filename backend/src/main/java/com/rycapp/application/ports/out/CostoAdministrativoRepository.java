package com.rycapp.application.ports.out;

import com.rycapp.domain.model.CostoAdministrativo;

import java.util.List;
import java.util.Optional;

public interface CostoAdministrativoRepository {
    CostoAdministrativo save(CostoAdministrativo entity);
    Optional<CostoAdministrativo> findById(Long id);
    List<CostoAdministrativo> findAll();
}
