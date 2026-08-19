---
id: security-roles
title: Roles y permisos
module: 07_SECURITY
layer: security
status: active
owner: security
generated: 2026-07-13
version: "1.0.0"
depends_on: [security-authorization]
related_modules: [roles, usuarios]
tags: [roles]
when_to_update: Nuevos roles en migraciones o mapeo JWT
source_paths:
  - backend/src/main/resources/db/migration/
  - frontend/src/features/auth/roles.ts
---

# ROLES_PERMISSIONS.md

## Roles en BD (Descripcion)

| Rol | Origen |
|-----|--------|
| Administrador | V1 |
| Usuario registrado | V2 |
| Conductor | V3 |
| Contador | V4 |

## Permisos explícitos (código)

Ver AUTHORIZATION.md y `roles.ts`:
- ROLES_CONSULTA_HISTORIAL
- ROLES_TICKETS_CARGA / CONSULTA / AUDITORIA
- ROLES_SIIGO

Permisos granulares tipo ACL/scopes: no existen.
