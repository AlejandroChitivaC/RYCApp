package com.rycapp.domain.model;

public record TipoCosto(
        Long id,
        String tipoCosto,
        String flujo,
        String descripcion,
        String estado
) {}
