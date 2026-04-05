package com.rycapp.application.ports.out;

import com.rycapp.domain.model.CostoVehiculo;

import java.util.List;
import java.util.Optional;

public interface CostoVehiculoRepository {
    CostoVehiculo save(CostoVehiculo entity);
    Optional<CostoVehiculo> findById(Long id);
    List<CostoVehiculo> findAll();
}
