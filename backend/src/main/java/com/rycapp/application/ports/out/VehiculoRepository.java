package com.rycapp.application.ports.out;

import com.rycapp.domain.model.Vehiculo;

import java.util.List;
import java.util.Optional;

public interface VehiculoRepository {
    Vehiculo save(Vehiculo vehiculo);
    Optional<Vehiculo> findById(String id);
    List<Vehiculo> findAll();
    boolean existsByPlacaIgnoreCase(String placa);

    /** true si otro vehículo (distinto de excluirVehiculoId, si no es null) ya usa este conductor */
    boolean conductorAsignadoOtroVehiculo(String conductorId, String excluirVehiculoId);
}

