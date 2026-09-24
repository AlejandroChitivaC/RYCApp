package com.rycapp.application.ports.out;

import com.rycapp.domain.model.LineaNegocio;

import java.util.List;
import java.util.Optional;

public interface LineaNegocioRepository {
    LineaNegocio save(LineaNegocio lineaNegocio);
    Optional<LineaNegocio> findById(String id);
    List<LineaNegocio> findAll();
    boolean existsByLineaNegocioIgnoreCase(String lineaNegocio);
}
