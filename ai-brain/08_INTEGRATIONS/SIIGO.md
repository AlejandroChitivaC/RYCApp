---
id: integration-siigo
title: Integración Siigo
module: 08_INTEGRATIONS
layer: integration
status: active
owner: backend
generated: 2026-07-13
version: "1.0.0"
depends_on: [backend-siigo, api-siigo]
related_modules: [siigo]
tags: [siigo, integration]
when_to_update: Cambios en infrastructure/siigo o SiigoConnectionService
source_paths:
  - backend/src/main/java/com/rycapp/infrastructure/siigo/
  - backend/src/main/java/com/rycapp/application/service/SiigoConnectionService.java
  - backend/src/main/resources/application.yml
---

# SIIGO.md

## Arquitectura

```
SiigoController → SiigoConnectionUseCase/Service
  → SiigoAuthPort (SiigoAuthAdapter)
  → SiigoQueryPort (SiigoQueryAdapter)
  → RestClient (SiigoConfig) → https://api.siigo.com
```

Config: `app.siigo.*` — base-url, username, access-key, partner-id, timeouts.
Env: `SIIGO_USERNAME`, `SIIGO_ACCESS_KEY`, `SIIGO_PARTNER_ID` (default Partner-Id `RYCApp`).

## Autenticación externa

- POST `/auth` con body JSON `username` + `access_key` y header `Partner-Id`.
- Respuesta token Bearer usado en queries.

## Endpoints externos usados

| Método | Path Siigo | Uso |
|--------|------------|-----|
| POST | `/auth` | Token |
| GET | `/v1/document-types?type=FV` | Tipos factura venta |
| GET | `/v1/users?page=1&page_size=5` | Sample usuarios |

## Endpoints RYCApp

Ver `06_API/SIIGO.md` — solo ADMIN.

## Flujos

1. **Health:** credentialsConfigured? → obtenerToken → HealthResult (no expone token al cliente).
2. **Consulta:** token → document types + users summary → ConsultaResult.

## Sincronización

**No implementada.** Etapa actual: verificación de cuenta (comentario `application.yml`).

## Errores

- Credenciales ausentes → mensaje en result (`connected=false` / success=false).
- `SiigoAuthException` / `SiigoQueryException` / `IllegalStateException` capturados en service → result fallido.

## Reintentos

No hay política de retry/backoff en adapters. **Pendiente de definición funcional.**

## Rate limits

No hay manejo explícito de rate limit Siigo. **Pendiente de definición funcional.**

## Responsabilidades

| Componente | Responsabilidad |
|------------|-----------------|
| Properties/Config | URL, credenciales, timeouts, RestClient bean |
| AuthAdapter | obtener token |
| QueryAdapter | lecturas de verificación |
| ConnectionService | orquestación y mensajes |
| Controller | exposición admin + DTO mapping |
| Frontend SiigoConnectionPage | UI health/consulta + activity log |

## Futuras extensiones

Escritura facturas, sync operaciones, webhooks: **Pendiente de definición funcional** + ADR.
