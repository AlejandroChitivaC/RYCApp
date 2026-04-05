package com.rycapp.application.ports.in;

import com.rycapp.domain.model.Vehiculo;

import java.util.List;

public interface VehiculoUseCase {
    Vehiculo crear(String placa, String clase, String marca, String modelo);
    Vehiculo editar(Long id, String placa, String clase, String marca, String modelo);
    List<Vehiculo> listar();
    Vehiculo obtener(Long id);
}
