package com.rycapp.domain.model;

public record UsuarioPendienteActivacion(
        String id,
        String cedula,
        String nombre,
        String apellido,
        String correo
) {}
