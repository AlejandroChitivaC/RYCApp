---
id: architecture-overview
title: Arquitectura del sistema
module: 01_ARCHITECTURE
layer: architecture
status: active
owner: architecture
generated: 2026-07-13
version: "1.0.0"
depends_on: [project-overview, project-adrs]
related_entities: []
related_modules: [backend, frontend]
tags: [c4, arc42, hexagonal, clean]
when_to_update: Cambios de capas, nuevos bounded contexts o estilo arquitectónico
source_paths:
  - backend/src/main/java/com/rycapp/
  - frontend/src/
---

# ARCHITECTURE.md

## Estilo arquitectónico

| Capa del sistema | Estilo | Evidencia |
|------------------|--------|-----------|
| Sistema completo | Monorepo cliente-servidor (SPA + API REST) | `frontend/`, `backend/` |
| Backend | Clean Architecture + Hexagonal (ports & adapters) | paquetes `domain` / `application` / `infrastructure` / `interfaces` |
| Frontend | Feature-sliced ligera | `app` / `features` / `shared` |

## Justificación (inferida)

- Aislar reglas de negocio de frameworks (JPA, Security, HTTP, Siigo).
- Permitir evolución de integraciones (Siigo, PDF, Mail) vía puertos.
- Organizar UI por capacidad de negocio (features).

Motivación de producto detallada: **Pendiente de definición funcional**.

## Capas backend (dependencias permitidas)

```
interfaces.rest  →  application  →  domain
       ↓                ↓
infrastructure  →  application.ports.out / domain
```

Regla: **domain no depende de nada externo**. Application define ports; infrastructure e interfaces implementan/adaptan.

## Responsabilidades

| Capa | Responsabilidad |
|------|-----------------|
| `domain.model` | Datos de negocio inmutables (records) |
| `application.ports.in` | Contratos de casos de uso |
| `application.ports.out` | Contratos de persistencia/integración |
| `application.service` | Orquestación y reglas de negocio |
| `infrastructure.persistence` | JPA entities, mappers, adapters |
| `infrastructure.security` | JWT, password, OTP |
| `infrastructure.mail` | Correo OTP / notificaciones |
| `infrastructure.pdf` | Conversión imagen→PDF |
| `infrastructure.siigo` | Cliente HTTP Siigo |
| `interfaces.rest` | Controllers, DTOs, exception handler, CORS |

## Flujo de llamada típico (comando)

```
HTTP → Controller → UseCase/Service → Port Out → Adapter → DB/API externa
                 ↘ Mapper DTO ↔ Domain
```

Ejemplo tickets: `TicketController` → `TicketUseCase`/`TicketService` → `TicketRepository` + `PdfConversionPort` → adapters.

Excepción: `AuthController` → `AuthService` → JPA repos (sin port-in).

## Flujo frontend

```
Page → Store (Zustand) → api.ts (Axios/httpClient) → Backend /api/**
     ↘ RequireAuth / RequireRole
```

## Principios observados

- Separación de concerns por capa.
- Inversión de dependencias vía ports.
- API-first REST JSON (+ multipart tickets).
- Seguridad defense-in-depth: filtro JWT + `@PreAuthorize` selectivo.
- Schema as code (Flyway).

## Restricciones

- Dominio anémico: no domain events, no aggregates ricos.
- Autorización por literales de rol (frágil a renombres).
- Muchos endpoints de catálogo/costos autenticados **sin** `@PreAuthorize` fino (cualquier usuario autenticado).
- CORS origins hardcodeados/configurados en YAML.
- Sin CQRS, outbox ni mensajería.

## Extensibilidad

Ver `EXTENSION_GUIDE.md`. Punto de extensión preferido: nuevo `*UseCase` + `*Service` + port out + adapter + controller + (opcional) feature frontend.

## Vista C4 (resumen)

Ver diagramas en `10_DIAGRAMS/`. Context: usuarios (Admin/Contador/Conductor) + SPA + API + MySQL + Siigo + SMTP.

## Evolución

Actualizar ante nuevo paquete de capa, cambio de estilo o nueva integración transversal.
