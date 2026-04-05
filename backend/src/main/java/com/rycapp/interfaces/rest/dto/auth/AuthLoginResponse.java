package com.rycapp.interfaces.rest.dto.auth;

public record AuthLoginResponse(
        String accessToken,
        String tokenType,
        long expiresInMinutes,
        AuthUserSummary usuario
) {}
