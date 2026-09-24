package com.rycapp.application.ports.in;

import com.rycapp.domain.model.Vehiculo;

import java.util.List;

public interface VehiculoUseCase {
    Vehiculo crear(String placa, String clase, String marca, String modelo, Long conductorId);
    Vehiculo editar(Long id, String placa, String clase, String marca, String modelo, Long conductorId);
    Vehiculo cambiarEstado(Long id, String estado);
    List<Vehiculo> listar();
    Vehiculo obtener(Long id);
}
