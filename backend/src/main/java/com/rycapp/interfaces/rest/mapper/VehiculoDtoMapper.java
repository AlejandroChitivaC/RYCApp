package com.rycapp.interfaces.rest.mapper;

import com.rycapp.domain.model.Vehiculo;
import com.rycapp.interfaces.rest.dto.vehiculo.VehiculoResponse;

public final class VehiculoDtoMapper {
    private VehiculoDtoMapper() {}

    public static VehiculoResponse toResponse(Vehiculo domain) {
        return new VehiculoResponse(
                domain.id(),
                domain.placa(),
                domain.clase(),
                domain.marca(),
                domain.modelo(),
                domain.estado()
        );
    }
}
