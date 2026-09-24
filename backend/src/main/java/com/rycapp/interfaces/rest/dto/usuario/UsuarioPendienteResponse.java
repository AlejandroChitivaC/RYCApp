package com.rycapp.interfaces.rest.dto.usuario;

public record UsuarioPendienteResponse(
        String id,
        String cedula,
        String nombre,
        String apellido,
        String correo
) {}
