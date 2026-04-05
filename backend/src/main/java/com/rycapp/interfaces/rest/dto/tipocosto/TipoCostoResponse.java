package com.rycapp.interfaces.rest.dto.tipocosto;

public record TipoCostoResponse(
        Long id,
        String tipoCosto,
        String flujo,
        String descripcion,
        String estado
) {}
