package com.rycapp.application.ports.out;

import com.rycapp.domain.model.CostoVehiculo;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface CostoVehiculoRepository {
    CostoVehiculo save(CostoVehiculo entity);
    Optional<CostoVehiculo> findById(String id);
    List<CostoVehiculo> findAll();
    List<CostoVehiculo> findByFechaInsercionBetween(Instant from, Instant to);
}
