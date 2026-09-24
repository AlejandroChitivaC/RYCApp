package com.rycapp.interfaces.rest.dto.proveedor;

public record ProveedorResponse(
        String id,
        String nombre,
        String nit,
        String departamento,
        String municipio,
        String descripcion,
        String estado
) {}
