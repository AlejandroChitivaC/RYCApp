package com.rycapp.application.ports.in;

import com.rycapp.domain.model.Vehiculo;

import java.util.List;

public interface VehiculoUseCase {
    Vehiculo crear(String placa, String clase, String marca, String modelo, String conductorId);
    Vehiculo editar(String id, String placa, String clase, String marca, String modelo, String conductorId);
    Vehiculo cambiarEstado(String id, String estado);
    List<Vehiculo> listar();
    Vehiculo obtener(String id);
}
