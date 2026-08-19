---
id: api-operaciones
title: Endpoints Operaciones
module: 06_API
layer: api
status: active
owner: backend
generated: 2026-07-13
version: "1.0.0"
depends_on: [api-index]
related_modules: [operaciones]
tags: [api]
when_to_update: Cambios OperacionController
source_paths:
  - backend/src/main/java/com/rycapp/interfaces/rest/controller/OperacionController.java
---

# OPERACIONES — `/api/operaciones`

| Método | Path | Authz | Notas |
|--------|------|-------|-------|
| POST | `/` | autenticado | usuarioRegistro desde JWT |
| GET | `/` | autenticado | query: from, to, lineaNegocioId, vehiculoId, proveedorId |
| GET | `/historial` | ROLE_ADMIN \| ROLE_CONTADOR | filtros sin vehiculoId |
| GET | `/<built-in function id>` | autenticado | OperacionResponse |

Request create: `OperacionCreateRequest`.
