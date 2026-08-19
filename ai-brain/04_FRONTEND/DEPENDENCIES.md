---
id: frontend-dependencies
title: Dependencias frontend
module: 04_FRONTEND
layer: frontend
status: active
owner: frontend
generated: 2026-07-13
version: "1.0.0"
depends_on: [architecture-dependencies]
related_modules: []
tags: [dependencies]
when_to_update: Cambios en package.json o api.ts
source_paths:
  - frontend/package.json
  - frontend/src/app/http/httpClient.ts
  - frontend/.env.example
---

# DEPENDENCIES.md (frontend)

## npm

Ver `01_ARCHITECTURE/DEPENDENCIES.md` sección frontend.

## Runtime config

| Variable | Uso |
|----------|-----|
| `VITE_API_BASE_URL` | Base API (default `http://localhost:8080`) |

Documentada en `frontend/.env.example`.

## Cliente HTTP

`httpClient.ts`: Bearer `rycapp_token`, header ngrok-skip, limpia Content-Type en FormData, 401 → logout redirect `/login`.

## Dependencias feature → API

Cada `features/*/api.ts` → endpoints en `06_API/`.
