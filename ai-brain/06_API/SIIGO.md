---
id: api-siigo
title: Endpoints Siigo (app)
module: 06_API
layer: api
status: active
owner: backend
generated: 2026-07-13
version: "1.0.0"
depends_on: [api-index, integration-siigo]
related_modules: [siigo]
tags: [api, siigo]
when_to_update: Cambios SiigoController / DTOs
source_paths:
  - backend/src/main/java/com/rycapp/interfaces/rest/controller/SiigoController.java
---

# SIIGO (expuestos por RYCApp) — `/api/siigo`

| Método | Path | Authz | Response |
|--------|------|-------|----------|
| GET | `/health` | ROLE_ADMIN | SiigoHealthResponse |
| GET | `/consulta` | ROLE_ADMIN | SiigoConsultaResponse |

Endpoints externos Siigo: ver `08_INTEGRATIONS/SIIGO.md`.
