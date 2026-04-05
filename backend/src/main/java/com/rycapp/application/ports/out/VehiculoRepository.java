package com.rycapp.application.ports.out;

import com.rycapp.domain.model.Vehiculo;

import java.util.List;
import java.util.Optional;

public interface VehiculoRepository {
    Vehiculo save(Vehiculo vehiculo);
    Optional<Vehiculo> findById(Long id);
    List<Vehiculo> findAll();
    boolean existsByPlacaIgnoreCase(String placa);
}

