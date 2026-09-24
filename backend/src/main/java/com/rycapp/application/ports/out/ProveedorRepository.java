package com.rycapp.application.ports.out;

import com.rycapp.domain.model.Proveedor;

import java.util.List;
import java.util.Optional;

public interface ProveedorRepository {
    Proveedor save(Proveedor proveedor);
    Optional<Proveedor> findById(String id);
    List<Proveedor> findAll();
    Optional<Proveedor> findByNitIgnoreCase(String nit);
    boolean existsByNitIgnoreCase(String nit);
}
