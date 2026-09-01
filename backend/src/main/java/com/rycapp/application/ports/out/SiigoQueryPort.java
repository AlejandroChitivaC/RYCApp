package com.rycapp.application.ports.out;

import java.util.List;

/**
 * Consultas de solo lectura a Siigo para validar que el token opera sobre la cuenta correcta.
 */
public interface SiigoQueryPort {

    List<DocumentTypeSummary> listarTiposFacturaVenta(String accessToken);

    UsersSummary resumenUsuarios(String accessToken);

    InvoicesPage listarFacturas(String accessToken, int page, int pageSize);

    record DocumentTypeSummary(long id, String code, String name, String prefix, boolean active) {}

    record UsersSummary(int totalResults, List<UserSummary> sample) {}

    record UserSummary(long id, String username, String email, boolean active) {}

    record InvoicesPage(int page, int pageSize, int totalResults, List<InvoiceSummary> results) {}

    record InvoiceSummary(
            String id,
            String name,
            String prefix,
            Integer number,
            String date,
            String customerIdentification,
            String customerId,
            String observations,
            java.math.BigDecimal total,
            java.math.BigDecimal balance,
            String dueDate,
            String stampStatus
    ) {}

    class SiigoQueryException extends RuntimeException {
        public SiigoQueryException(String message) {
            super(message);
        }

        public SiigoQueryException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
