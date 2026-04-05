package com.rycapp.interfaces.rest.dto.proveedor;

public record ProveedorResponse(
        Long id,
        String nombre,
        String nit,
        String departamento,
        String municipio,
        String descripcion
) {}
