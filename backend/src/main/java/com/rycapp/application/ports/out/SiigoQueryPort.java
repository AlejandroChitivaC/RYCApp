package com.rycapp.application.ports.out;

import java.util.List;

/**
 * Consultas de solo lectura a Siigo para validar que el token opera sobre la cuenta correcta.
 */
public interface SiigoQueryPort {

    List<DocumentTypeSummary> listarTiposFacturaVenta(String accessToken);

    UsersSummary resumenUsuarios(String accessToken);

    record DocumentTypeSummary(long id, String code, String name, String prefix, boolean active) {}

    record UsersSummary(int totalResults, List<UserSummary> sample) {}

    record UserSummary(long id, String username, String email, boolean active) {}

    class SiigoQueryException extends RuntimeException {
        public SiigoQueryException(String message) {
            super(message);
        }

        public SiigoQueryException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
