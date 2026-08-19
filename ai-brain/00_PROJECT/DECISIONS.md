---
id: project-adrs
title: Architecture Decision Records
module: 00_PROJECT
layer: architecture
status: active
owner: architecture
generated: 2026-07-13
version: "1.0.0"
depends_on: [architecture-overview]
related_entities: []
related_modules: [01_ARCHITECTURE]
tags: [adr, decisions]
when_to_update: Toda decisión arquitectónica nueva o cambio de trade-off
source_paths:
  - backend/src/main/java/com/rycapp/
  - backend/pom.xml
  - frontend/src/
---

# DECISIONS.md — ADRs

Los ADRs siguientes están **inferidos con evidencia suficiente** en el código. Donde la motivación no es explícita, se marca.

---

## ADR-001 — Arquitectura hexagonal / Clean en backend

| Campo | Valor |
|-------|-------|
| Estado | Aceptada (implícita) |
| Fecha | Inferida desde estructura de paquetes |
| Contexto | Separar dominio de frameworks Spring/JPA/HTTP |
| Decisión | Paquetes `domain` / `application` (ports in/out + services) / `infrastructure` / `interfaces` |
| Consecuencias | Adapters intercambiables; dominio como records; use cases orquestan |
| Evidencia | `com.rycapp.domain`, `application.ports`, `infrastructure.*`, `interfaces.rest` |

---

## ADR-002 — Dominio anémico (Java records)

| Campo | Valor |
|-------|-------|
| Estado | Aceptada (implícita) |
| Decisión | Entidades de dominio como `record` inmutables sin comportamiento rico |
| Consecuencias | Reglas de negocio en application services; sin aggregates DDD ricos ni domain events |
| Evidencia | `domain/model/*.java` son records; no hay `domain/service` ni eventos |

---

## ADR-003 — Persistencia con Flyway + JPA validate

| Campo | Valor |
|-------|-------|
| Estado | Aceptada |
| Decisión | Schema versionado en SQL Flyway; Hibernate `ddl-auto: validate`; naming físico estándar (sin snake_case automático) |
| Consecuencias | Migraciones son fuente de verdad; nombres PascalCase en MySQL |
| Evidencia | `application.yml`, `db/migration/V*.sql` |

---

## ADR-004 — Seguridad JWT stateless + method security

| Campo | Valor |
|-------|-------|
| Estado | Aceptada |
| Decisión | Sesión `STATELESS`, filtro JWT, `@EnableMethodSecurity`, BCrypt strength 12 |
| Consecuencias | Frontend guarda token en `localStorage`; authorities derivadas del string de rol |
| Evidencia | `SecurityConfig`, `JwtAuthenticationFilter`, `JwtService` |

---

## ADR-005 — Auth sin AuthUseCase (excepción hexagonal)

| Campo | Valor |
|-------|-------|
| Estado | Deuda / inconsistencia documentada |
| Decisión | `AuthService` inyectado directamente en `AuthController`; usa repos JPA directamente |
| Consecuencias | Auth no sigue el patrón port-in de otros módulos |
| Evidencia | Ausencia de `AuthUseCase`; `AuthService` + JPA repos |

---

## ADR-006 — Frontend feature-sliced + Zustand

| Campo | Valor |
|-------|-------|
| Estado | Aceptada (implícita) |
| Decisión | Capas `app` / `features` / `shared`; estado por feature con Zustand; Axios centralizado |
| Consecuencias | Bajo acoplamiento entre features; sin React Query |
| Evidencia | `frontend/src/{app,features,shared}`, `store.ts` por feature |

---

## ADR-007 — Integración Siigo detrás de puertos

| Campo | Valor |
|-------|-------|
| Estado | Aceptada |
| Decisión | `SiigoAuthPort` + `SiigoQueryPort` + adapters RestClient; exposición solo admin |
| Consecuencias | Facilita evolucionar a sync/escritura sin contaminar dominio |
| Evidencia | `infrastructure/siigo/*`, `SiigoConnectionService` |
| Nota | Etapa actual: verificación, no sincronización de negocio |

---

## ADR-008 — Tickets: imagen → PDF + hash único

| Campo | Valor |
|-------|-------|
| Estado | Aceptada |
| Decisión | Almacenar contenido convertido (PDFBox), deduplicar por SHA-256, auditar acciones |
| Consecuencias | Límite 10MB; solo JPEG/PNG/GIF/BMP; consulta/descarga separadas |
| Evidencia | `TicketService`, `PdfConversionPort`, `V6__tickets.sql` |

---

## ADR-009 — RBAC por rol string + authorities mapeadas

| Campo | Valor |
|-------|-------|
| Estado | Aceptada |
| Decisión | Rol en JWT como descripción textual; filtro mapea a `ROLE_*`; UI usa mismos strings |
| Consecuencias | Acoplamiento a literales en español; cambio de nombre de rol rompe seguridad |
| Evidencia | `JwtAuthenticationFilter`, `frontend/src/features/auth/roles.ts` |

---

## ADR-010 — Monorepo sin Docker

| Campo | Valor |
|-------|-------|
| Estado | De facto |
| Decisión | Scripts `run-local.*` + MySQL local; deploy backend por SSH a EC2 |
| Motivación explícita | **Pendiente de definición funcional** |
| Evidencia | Ausencia de Docker; presencia de scripts y workflow |

---

## Cómo añadir un ADR

1. Incrementar `ADR-NNN`.
2. Incluir: contexto, decisión, consecuencias, evidencia (paths).
3. Actualizar `11_METADATA/llm-index.json`.
