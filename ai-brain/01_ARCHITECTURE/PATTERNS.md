---
id: architecture-patterns
title: Patrones utilizados
module: 01_ARCHITECTURE
layer: architecture
status: active
owner: architecture
generated: 2026-07-13
version: "1.0.0"
depends_on: [architecture-overview]
related_modules: []
tags: [patterns]
when_to_update: Introducción o eliminación de un patrón transversal
source_paths:
  - backend/src/main/java/com/rycapp/
  - frontend/src/
---

# PATTERNS.md

| Patrón | Dónde | Evidencia |
|--------|-------|-----------|
| Hexagonal / Ports & Adapters | Backend | `ports.in`, `ports.out`, `*Adapter` |
| Application Service | Backend | `application.service.*` |
| Repository | Backend | interfaces out + adapters JPA |
| DTO + Mapper | Interfaces REST / persistence | `interfaces.rest.dto`, `*Mapper` |
| Dependency Injection | Spring | constructores + `@Service`/`@RestController` |
| Filter Chain | Security | `JwtAuthenticationFilter` |
| Global Exception Handler | REST | `GlobalExceptionHandler` |
| Strategy / Policy | Password | `PasswordPolicy` |
| Adapter externo | Siigo, PDF, Mail | `Siigo*Adapter`, `PdfConversionAdapter`, `Mail*` |
| Feature modules | Frontend | `features/*` |
| Store per feature | Frontend | Zustand `create` |
| Route guards | Frontend | `RequireAuth`, `RequireRole` |
| HTTP Interceptor | Frontend | Axios request/response en `httpClient.ts` |
| Schema migration | DB | Flyway versioned SQL |

## No usados (evidencia de ausencia)

CQRS, Event Sourcing, Domain Events, Outbox, Saga, GraphQL, gRPC, React Query, Redux.
