package com.rycapp.application.ports.out;

/**
 * Puerto de salida para autenticación contra Siigo API.
 * El dominio no conoce HTTP ni DTOs de Siigo.
 */
public interface SiigoAuthPort {

    boolean credentialsConfigured();

    /**
     * Metadatos de configuración visibles (sin secretos).
     */
    ConnectionMeta connectionMeta();

    /**
     * Obtiene un access token Bearer válido.
     *
     * @throws IllegalStateException si las credenciales no están configuradas
     * @throws SiigoAuthException    si Siigo rechaza la autenticación o hay error de red
     */
    SiigoToken obtenerToken();

    record SiigoToken(String accessToken, long expiresInSeconds, String tokenType) {}

    record ConnectionMeta(String baseUrl, String partnerId, String username) {}

    class SiigoAuthException extends RuntimeException {
        public SiigoAuthException(String message) {
            super(message);
        }

        public SiigoAuthException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
