package com.rycapp.domain.model;

public record Proveedor(
        Long id,
        String nombre,
        String nit,
        String departamento,
        String municipio,
        String descripcion
) {}
