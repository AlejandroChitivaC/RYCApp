package com.rycapp.domain.model;

public record Vehiculo(
        Long id,
        String placa,
        String clase,
        String marca,
        String modelo,
        String estado
) {}
