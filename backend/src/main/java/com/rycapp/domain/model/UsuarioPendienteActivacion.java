package com.rycapp.domain.model;

public record UsuarioPendienteActivacion(
        Long id,
        String cedula,
        String nombre,
        String apellido,
        String correo
) {}
