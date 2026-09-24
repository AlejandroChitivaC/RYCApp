package com.rycapp.interfaces.rest.dto.vehiculo;

public record VehiculoResponse(
        String id,
        String placa,
        String clase,
        String marca,
        String modelo,
        String estado,
        String conductorId,
        String conductorNombre
) {}
