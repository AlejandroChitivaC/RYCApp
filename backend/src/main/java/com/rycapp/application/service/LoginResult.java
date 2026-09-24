package com.rycapp.application.service;

public record LoginResult(
        String accessToken,
        String usuarioId,
        String correo,
        String nombre,
        String apellido,
        String rolDescripcion
) {}
