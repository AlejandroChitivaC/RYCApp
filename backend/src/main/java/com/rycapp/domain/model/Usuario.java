package com.rycapp.domain.model;

public record Usuario(
        Long id,
        Long rolId,
        String cedula,
        String nombre,
        String apellido,
        String estado
) {}
