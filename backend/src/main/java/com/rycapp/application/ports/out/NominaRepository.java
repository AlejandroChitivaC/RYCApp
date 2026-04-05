package com.rycapp.application.ports.out;

import com.rycapp.domain.model.Nomina;

import java.util.List;
import java.util.Optional;

public interface NominaRepository {
    Nomina save(Nomina entity);
    Optional<Nomina> findById(Long id);
    List<Nomina> findAll();
}
