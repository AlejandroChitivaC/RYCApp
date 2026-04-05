package com.rycapp.infrastructure.security;

public record JwtPrincipal(long usuarioId, String email, String nombre, String apellido, String rolDescripcion) {}
