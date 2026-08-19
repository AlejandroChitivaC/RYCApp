---
id: api-index
title: Catálogo API REST
module: 06_API
layer: api
status: active
owner: backend
generated: 2026-07-13
version: "1.0.0"
depends_on: [architecture-modules]
related_modules: []
tags: [api, rest]
when_to_update: Cambios en Controllers o DTOs
source_paths:
  - backend/src/main/java/com/rycapp/interfaces/rest/controller/
---

# API REST

Base: `http://localhost:8080` (local). Prefijo `/api`.

Autenticación: `Authorization: Bearer <JWT>` salvo endpoints públicos auth.

Error estándar: `ApiErrorResponse` — `timestamp, status, error, message, path, fieldErrors, code`.

Documentos por área: AUTH, USUARIOS, CATALOGOS, OPERACIONES, COSTOS, TICKETS, SIIGO, ERRORS.
