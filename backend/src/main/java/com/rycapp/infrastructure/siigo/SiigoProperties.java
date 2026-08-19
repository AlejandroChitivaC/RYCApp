package com.rycapp.infrastructure.siigo;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.siigo")
public record SiigoProperties(
        String baseUrl,
        String username,
        String accessKey,
        String partnerId,
        int connectTimeoutMs,
        int readTimeoutMs
) {
    public boolean credentialsConfigured() {
        return username != null && !username.isBlank()
                && accessKey != null && !accessKey.isBlank();
    }
}
