package com.rycapp.application.ports.out;

import com.rycapp.domain.model.Rol;

import java.util.List;
import java.util.Optional;

public interface RolRepository {
    Rol save(Rol rol);

    List<Rol> findAll();

    Optional<Rol> findById(String id);

    Optional<Rol> findByDescripcion(String descripcion);
}
