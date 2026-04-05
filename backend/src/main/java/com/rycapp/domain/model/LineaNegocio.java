package com.rycapp.domain.model;

public record LineaNegocio(
        Long id,
        String lineaNegocio,
        String descripcion,
        String estado
) {}
