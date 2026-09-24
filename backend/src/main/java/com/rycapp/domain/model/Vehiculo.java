package com.rycapp.domain.model;

public record Vehiculo(
        String id,
        String placa,
        String clase,
        String marca,
        String modelo,
        String estado,
        String conductorId
) {}
