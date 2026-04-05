package com.rycapp.interfaces.rest.dto.lineanegocio;

public record LineaNegocioResponse(
        Long id,
        String lineaNegocio,
        String descripcion,
        String estado
) {}
