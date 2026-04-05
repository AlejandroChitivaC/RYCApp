package com.rycapp.interfaces.rest.dto.usuario;

public record UsuarioResponse(
        Long id,
        Long rolId,
        String cedula,
        String nombre,
        String apellido,
        String estado
) {}
