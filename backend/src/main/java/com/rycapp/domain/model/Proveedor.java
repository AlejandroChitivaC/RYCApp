package com.rycapp.domain.model;

public record Proveedor(
        String id,
        String nombre,
        String nit,
        String departamento,
        String municipio,
        String descripcion,
        String estado
) {}
