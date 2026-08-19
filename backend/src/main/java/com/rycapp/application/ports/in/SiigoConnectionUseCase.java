package com.rycapp.application.ports.in;

import java.util.List;

/**
 * Verifica conectividad y consulta de solo lectura contra Siigo API.
 */
public interface SiigoConnectionUseCase {

    HealthResult verificarConexion();

    ConsultaResult consultarCuenta();

    /**
     * @param connected          true si se obtuvo un token válido
     * @param configured         true si username y access_key están presentes
     * @param message            mensaje legible (sin secretos)
     * @param tokenType          tipo de token (ej. Bearer), null si falló
     * @param expiresInSeconds   vigencia reportada por Siigo, null si falló
     */
    record HealthResult(
            boolean connected,
            boolean configured,
            String message,
            String tokenType,
            Long expiresInSeconds
    ) {}

    /**
     * Resultado de una consulta real a catálogos Siigo (no solo auth).
     */
    record ConsultaResult(
            boolean ok,
            boolean configured,
            String message,
            String baseUrl,
            String partnerId,
            String username,
            int documentTypesCount,
            List<DocumentTypeItem> documentTypes,
            int usersTotal,
            List<UserItem> usersSample
    ) {}

    record DocumentTypeItem(long id, String code, String name, String prefix, boolean active) {}

    record UserItem(long id, String username, String email, boolean active) {}
}
