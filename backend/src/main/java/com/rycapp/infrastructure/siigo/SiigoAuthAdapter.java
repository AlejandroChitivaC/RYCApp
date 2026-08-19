package com.rycapp.infrastructure.siigo;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.rycapp.application.ports.out.SiigoAuthPort;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.Map;

@Component
public class SiigoAuthAdapter implements SiigoAuthPort {

    private static final Logger log = LoggerFactory.getLogger(SiigoAuthAdapter.class);

    private final RestClient siigoRestClient;
    private final SiigoProperties properties;

    public SiigoAuthAdapter(
            @Qualifier(SiigoConfig.SIIGO_REST_CLIENT) RestClient siigoRestClient,
            SiigoProperties properties
    ) {
        this.siigoRestClient = siigoRestClient;
        this.properties = properties;
    }

    @Override
    public boolean credentialsConfigured() {
        return properties.credentialsConfigured();
    }

    @Override
    public ConnectionMeta connectionMeta() {
        return new ConnectionMeta(
                properties.baseUrl(),
                properties.partnerId(),
                properties.username()
        );
    }

    @Override
    public SiigoToken obtenerToken() {
        if (!properties.credentialsConfigured()) {
            throw new IllegalStateException(
                    "Credenciales Siigo no configuradas (SIIGO_USERNAME / SIIGO_ACCESS_KEY).");
        }
        if (properties.partnerId() == null || properties.partnerId().isBlank()) {
            throw new IllegalStateException("Partner-Id de Siigo no configurado (SIIGO_PARTNER_ID).");
        }

        try {
            AuthResponse body = siigoRestClient.post()
                    .uri("/auth")
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("Partner-Id", properties.partnerId())
                    .body(Map.of(
                            "username", properties.username().trim(),
                            "access_key", properties.accessKey().trim()
                    ))
                    .retrieve()
                    .body(AuthResponse.class);

            if (body == null || body.accessToken() == null || body.accessToken().isBlank()) {
                throw new SiigoAuthException("Siigo no devolvió un access_token válido.");
            }

            String tokenType = body.tokenType() != null && !body.tokenType().isBlank()
                    ? body.tokenType()
                    : "Bearer";
            long expiresIn = body.expiresIn() != null ? body.expiresIn() : 0L;

            log.info("[Siigo] Auth OK | tokenType={} expiresIn={}s", tokenType, expiresIn);
            return new SiigoToken(body.accessToken(), expiresIn, tokenType);
        } catch (RestClientResponseException ex) {
            log.warn("[Siigo] Auth rechazada | HTTP {} | {}", ex.getStatusCode().value(), sanitize(ex.getResponseBodyAsString()));
            throw new SiigoAuthException(
                    "Siigo rechazó la autenticación (HTTP " + ex.getStatusCode().value() + "). Verifica username, access_key y Partner-Id.",
                    ex
            );
        } catch (SiigoAuthException | IllegalStateException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("[Siigo] Auth error de red | {}", ex.getMessage());
            throw new SiigoAuthException("No se pudo conectar con Siigo API: " + ex.getMessage(), ex);
        }
    }

    private static String sanitize(String body) {
        if (body == null || body.isBlank()) {
            return "(vacío)";
        }
        return body.length() > 300 ? body.substring(0, 300) + "..." : body;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record AuthResponse(
            @JsonProperty("access_token") String accessToken,
            @JsonProperty("expires_in") Long expiresIn,
            @JsonProperty("token_type") String tokenType,
            String scope
    ) {}
}
