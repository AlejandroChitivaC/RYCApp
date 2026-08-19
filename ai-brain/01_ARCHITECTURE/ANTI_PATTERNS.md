---
id: architecture-anti-patterns
title: Anti-patrones y deudas
module: 01_ARCHITECTURE
layer: architecture
status: active
owner: architecture
generated: 2026-07-13
version: "1.0.0"
depends_on: [architecture-patterns, project-adrs]
related_modules: [auth]
tags: [anti-patterns, tech-debt]
when_to_update: Al resolver o descubrir nuevas deudas
source_paths:
  - backend/src/main/java/com/rycapp/application/service/AuthService.java
  - backend/src/main/java/com/rycapp/infrastructure/security/
  - frontend/src/features/clientes/
---

# ANTI_PATTERNS.md

Documentación de hallazgos; **no son órdenes de refactor** (AIKB no modifica código).

| Hallazgo | Tipo | Evidencia | Riesgo |
|----------|------|-----------|--------|
| Auth sin port-in / acceso JPA directo | Inconsistencia hexagonal | `AuthService` | Dificulta tests y sustituir persistencia |
| Dominio anémico + reglas solo en services | Anemic domain | `domain/model` records | Lógica dispersa |
| Autorización gruesa en catálogos/costos | Over-permissive API | Controllers sin `@PreAuthorize` | Usuario autenticado no-admin puede mutar maestros |
| Roles como literales duplicados | Stringly-typed security | Filter + `roles.ts` | Renombrar rol rompe authz |
| Scaffolds vacíos clientes/conductores | Dead structure | dirs vacíos | Confusión para agentes/devs |
| CORS duplicado potencial | Config drift | `SecurityConfig` + `CorsConfig` | Comportamiento ambiguo |
| Secret JWT en `application.yml` default | Security smell | `app.jwt.secret` | Riesgo si se despliega sin override |
| Password DB default `root/root` en YAML | Security smell | `application.yml` | Solo aceptable en local |
| Sin tests pese a starters | Missing quality gate | ausencia `src/test` | Regresiones |
| UI costos ausente con API presente | Feature gap | backend controllers vs frontend | API huérfana desde UX |
| Token en localStorage | XSS surface | `storageKeys.ts` | Estándar SPA; riesgo conocido |

## Evolución

Marcar ítems como `resolved` en metadatos cuando el código cambie; no eliminar el histórico sin ADR.
