package com.rycapp.infrastructure.siigo;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.rycapp.application.ports.out.SiigoQueryPort;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Component
public class SiigoQueryAdapter implements SiigoQueryPort {

    private static final Logger log = LoggerFactory.getLogger(SiigoQueryAdapter.class);
    private static final int SAMPLE_LIMIT = 5;

    private final RestClient siigoRestClient;
    private final SiigoProperties properties;

    public SiigoQueryAdapter(
            @Qualifier(SiigoConfig.SIIGO_REST_CLIENT) RestClient siigoRestClient,
            SiigoProperties properties
    ) {
        this.siigoRestClient = siigoRestClient;
        this.properties = properties;
    }

    @Override
    public List<DocumentTypeSummary> listarTiposFacturaVenta(String accessToken) {
        try {
            List<DocumentTypeDto> body = siigoRestClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/v1/document-types")
                            .queryParam("type", "FV")
                            .build())
                    .headers(h -> {
                        h.setBearerAuth(accessToken);
                        h.set("Partner-Id", properties.partnerId());
                    })
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {});

            if (body == null) {
                return List.of();
            }

            return body.stream()
                    .map(d -> new DocumentTypeSummary(
                            d.id() != null ? d.id() : 0L,
                            d.code(),
                            d.name(),
                            d.prefix(),
                            d.active() != null && d.active()
                    ))
                    .toList();
        } catch (RestClientResponseException ex) {
            log.warn("[Siigo] document-types falló | HTTP {} | {}",
                    ex.getStatusCode().value(), sanitize(ex.getResponseBodyAsString()));
            throw new SiigoQueryException(
                    "Siigo rechazó la consulta de tipos de factura (HTTP " + ex.getStatusCode().value() + ").",
                    ex
            );
        } catch (SiigoQueryException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("[Siigo] document-types error de red | {}", ex.getMessage());
            throw new SiigoQueryException("No se pudo consultar tipos de factura en Siigo: " + ex.getMessage(), ex);
        }
    }

    @Override
    public UsersSummary resumenUsuarios(String accessToken) {
        try {
            UsersPageDto body = siigoRestClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/v1/users")
                            .queryParam("page", 1)
                            .queryParam("page_size", SAMPLE_LIMIT)
                            .build())
                    .headers(h -> {
                        h.setBearerAuth(accessToken);
                        h.set("Partner-Id", properties.partnerId());
                    })
                    .retrieve()
                    .body(UsersPageDto.class);

            if (body == null) {
                return new UsersSummary(0, List.of());
            }

            int total = body.pagination() != null && body.pagination().totalResults() != null
                    ? body.pagination().totalResults()
                    : (body.results() != null ? body.results().size() : 0);

            List<UserSummary> sample = body.results() == null
                    ? List.of()
                    : body.results().stream()
                    .limit(SAMPLE_LIMIT)
                    .map(u -> new UserSummary(
                            u.id() != null ? u.id() : 0L,
                            u.username(),
                            u.email(),
                            u.active() != null && u.active()
                    ))
                    .toList();

            return new UsersSummary(total, sample);
        } catch (RestClientResponseException ex) {
            log.warn("[Siigo] users falló | HTTP {} | {}",
                    ex.getStatusCode().value(), sanitize(ex.getResponseBodyAsString()));
            throw new SiigoQueryException(
                    "Siigo rechazó la consulta de usuarios (HTTP " + ex.getStatusCode().value() + ").",
                    ex
            );
        } catch (SiigoQueryException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("[Siigo] users error de red | {}", ex.getMessage());
            throw new SiigoQueryException("No se pudo consultar usuarios en Siigo: " + ex.getMessage(), ex);
        }
    }

    @Override
    public InvoicesPage listarFacturas(String accessToken, int page, int pageSize) {
        try {
            InvoicesPageDto body = siigoRestClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/v1/invoices")
                            .queryParam("page", page)
                            .queryParam("page_size", pageSize)
                            .build())
                    .headers(h -> {
                        h.setBearerAuth(accessToken);
                        h.set("Partner-Id", properties.partnerId());
                    })
                    .retrieve()
                    .body(InvoicesPageDto.class);

            if (body == null) {
                return new InvoicesPage(page, pageSize, 0, List.of());
            }

            int total = body.pagination() != null && body.pagination().totalResults() != null
                    ? body.pagination().totalResults()
                    : (body.results() != null ? body.results().size() : 0);

            List<InvoiceSummary> results = new ArrayList<>();
            if (body.results() != null) {
                for (InvoiceDto inv : body.results()) {
                    results.add(toSummary(inv));
                }
            }
            return new InvoicesPage(
                    body.pagination() != null && body.pagination().page() != null ? body.pagination().page() : page,
                    body.pagination() != null && body.pagination().pageSize() != null ? body.pagination().pageSize() : pageSize,
                    total,
                    results
            );
        } catch (RestClientResponseException ex) {
            log.warn("[Siigo] invoices falló | HTTP {} | {}",
                    ex.getStatusCode().value(), sanitize(ex.getResponseBodyAsString()));
            throw new SiigoQueryException(
                    "Siigo rechazó la consulta de facturas (HTTP " + ex.getStatusCode().value() + ").",
                    ex
            );
        } catch (SiigoQueryException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("[Siigo] invoices error de red | {}", ex.getMessage());
            throw new SiigoQueryException("No se pudo consultar facturas en Siigo: " + ex.getMessage(), ex);
        }
    }

    private static InvoiceSummary toSummary(InvoiceDto inv) {
        String due = null;
        if (inv.payments() != null) {
            for (PaymentDto p : inv.payments()) {
                if (p.dueDate() != null && !p.dueDate().isBlank()) {
                    String d = p.dueDate().length() >= 10 ? p.dueDate().substring(0, 10) : p.dueDate();
                    if (due == null || d.compareTo(due) < 0) {
                        due = d;
                    }
                }
            }
        }
        String stamp = inv.stamp() != null ? inv.stamp().status() : null;
        String identification = inv.customer() != null ? inv.customer().identification() : null;
        String customerId = inv.customer() != null ? inv.customer().id() : null;
        String date = inv.date() != null && inv.date().length() >= 10 ? inv.date().substring(0, 10) : inv.date();
        return new InvoiceSummary(
                inv.id(),
                inv.name(),
                inv.prefix(),
                inv.number(),
                date,
                identification,
                customerId,
                inv.observations(),
                inv.total() != null ? inv.total() : BigDecimal.ZERO,
                inv.balance() != null ? inv.balance() : BigDecimal.ZERO,
                due,
                stamp
        );
    }

    private static String sanitize(String body) {
        if (body == null || body.isBlank()) {
            return "(vacío)";
        }
        return body.length() > 300 ? body.substring(0, 300) + "..." : body;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record DocumentTypeDto(
            Long id,
            String code,
            String name,
            String prefix,
            Boolean active
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record UsersPageDto(
            PaginationDto pagination,
            List<UserDto> results
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record PaginationDto(
            Integer page,
            @JsonProperty("page_size") Integer pageSize,
            @JsonProperty("total_results") Integer totalResults
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record UserDto(
            Long id,
            String username,
            String email,
            Boolean active
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record InvoicesPageDto(
            PaginationDto pagination,
            List<InvoiceDto> results
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record InvoiceDto(
            String id,
            String prefix,
            Integer number,
            String name,
            String date,
            CustomerDto customer,
            BigDecimal total,
            BigDecimal balance,
            String observations,
            List<PaymentDto> payments,
            StampDto stamp
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record CustomerDto(
            String id,
            String identification
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record PaymentDto(
            @JsonProperty("due_date") String dueDate
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record StampDto(
            String status
    ) {}
}
