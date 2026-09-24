package com.rycapp.application.ports.out;

import com.rycapp.domain.model.CuentaAutenticacion;

import java.util.Optional;

public interface CuentaAutenticacionRepository {
    CuentaAutenticacion save(CuentaAutenticacion cuenta);

    Optional<CuentaAutenticacion> findByCorreoIgnoreCase(String correo);

    Optional<CuentaAutenticacion> findByUsuarioId(String usuarioId);

    boolean existsByCorreoIgnoreCase(String correo);
}
