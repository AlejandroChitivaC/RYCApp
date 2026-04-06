package com.rycapp.application.ports.out;

import com.rycapp.domain.model.Rol;

import java.util.List;
import java.util.Optional;

public interface RolRepository {
    List<Rol> findAll();

    Optional<Rol> findById(Long id);

    Optional<Rol> findByDescripcion(String descripcion);
}
