package com.rycapp.interfaces.rest.dto.auth;

public record AuthUserSummary(
        String id,
        String correo,
        String nombre,
        String apellido,
        String rol
) {}
