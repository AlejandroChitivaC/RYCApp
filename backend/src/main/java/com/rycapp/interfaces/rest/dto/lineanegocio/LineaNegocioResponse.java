package com.rycapp.interfaces.rest.dto.lineanegocio;

public record LineaNegocioResponse(
        String id,
        String lineaNegocio,
        String descripcion,
        String estado
) {}
