package com.rycapp.interfaces.rest.dto.usuario;

public record UsuarioResponse(
        String id,
        String rolId,
        String cedula,
        String nombre,
        String apellido,
        String estado
) {}
