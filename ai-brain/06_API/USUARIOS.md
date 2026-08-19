---
id: api-usuarios
title: Endpoints Usuarios y Roles
module: 06_API
layer: api
status: active
owner: backend
generated: 2026-07-13
version: "1.0.0"
depends_on: [api-index]
related_modules: [usuarios, roles]
tags: [api]
when_to_update: Cambios UsuarioController / RolController
source_paths:
  - backend/src/main/java/com/rycapp/interfaces/rest/controller/UsuarioController.java
  - backend/src/main/java/com/rycapp/interfaces/rest/controller/RolController.java
---

# USUARIOS — `/api/usuarios`

| Método | Path | Authz | Request | Response |
|--------|------|-------|---------|----------|
| POST | `/` | autenticado | UsuarioCreateRequest | UsuarioResponse |
| PUT | `/<built-in function id>` | autenticado | UsuarioUpdateRequest | UsuarioResponse |
| GET | `/` | autenticado | — | List UsuarioResponse |
| GET | `/<built-in function id>` | autenticado | — | UsuarioResponse |
| GET | `/conductores` | autenticado | — | lista |
| GET | `/catalogo/estados-edicion` | autenticado | — | List String |
| GET | `/catalogo/roles-activacion-registro` | ROLE_ADMIN | — | List RolResponse |
| GET | `/pendientes-activacion` | ROLE_ADMIN | — | List UsuarioPendienteResponse |
| POST | `/<built-in function id>/activar` | ROLE_ADMIN | UsuarioActivarRequest | UsuarioResponse |

# ROLES — `/api/roles`

| Método | Path | Authz | Response |
|--------|------|-------|----------|
| GET | `/` | autenticado | List RolResponse |
