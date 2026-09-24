package com.rycapp.domain.model;

public record Usuario(
        String id,
        String rolId,
        String cedula,
        String nombre,
        String apellido,
        String estado
) {}
