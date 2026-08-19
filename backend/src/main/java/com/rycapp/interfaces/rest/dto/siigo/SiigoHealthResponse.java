package com.rycapp.interfaces.rest.dto.siigo;

public record SiigoHealthResponse(
        boolean connected,
        boolean configured,
        String message,
        String tokenType,
        Long expiresInSeconds
) {}
