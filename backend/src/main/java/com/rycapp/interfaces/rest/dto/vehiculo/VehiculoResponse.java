package com.rycapp.interfaces.rest.dto.vehiculo;

public record VehiculoResponse(
        Long id,
        String placa,
        String clase,
        String marca,
        String modelo,
        String estado,
        Long conductorId,
        String conductorNombre
) {}
