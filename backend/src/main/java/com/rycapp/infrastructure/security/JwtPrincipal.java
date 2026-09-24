package com.rycapp.infrastructure.security;

public record JwtPrincipal(String usuarioId, String email, String nombre, String apellido, String rolDescripcion) {}
