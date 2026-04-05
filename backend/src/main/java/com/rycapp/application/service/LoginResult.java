package com.rycapp.application.service;

public record LoginResult(
        String accessToken,
        long usuarioId,
        String correo,
        String nombre,
        String apellido,
        String rolDescripcion
) {}
