package com.rycapp.interfaces.rest.dto.usuario;

public record UsuarioPendienteResponse(
        Long id,
        String cedula,
        String nombre,
        String apellido,
        String correo
) {}
