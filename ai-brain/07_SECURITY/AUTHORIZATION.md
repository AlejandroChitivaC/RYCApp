---
id: security-authorization
title: Autorización
module: 07_SECURITY
layer: security
status: active
owner: security
generated: 2026-07-13
version: "1.0.0"
depends_on: [security-jwt, security-roles]
related_modules: []
tags: [authorization, rbac]
when_to_update: Cambios @PreAuthorize o roles.ts
source_paths:
  - backend/src/main/java/com/rycapp/interfaces/rest/controller/
  - frontend/src/features/auth/roles.ts
---

# AUTHORIZATION.md

## Capas

1. URL: `/api/**` authenticated (excepto públicos).
2. Method security: `@PreAuthorize` en endpoints sensibles.
3. UI: `RequireRole` + filtro nav.

## Matriz resumida

| Recurso | ADMIN | CONTADOR | CONDUCTOR | USER autenticado |
|---------|-------|----------|-----------|------------------|
| Activación usuarios / catálogo roles activación | ✓ | | | |
| Historial operaciones | ✓ | ✓ | | |
| Tickets carga | ✓ | | ✓ | |
| Tickets lectura/PDF | ✓ | ✓ | | |
| Tickets auditoría | ✓ | | | |
| Siigo | ✓ | | | |
| Catálogos CRUD / costos | *(cualquiera autenticado)* | idem | idem | ✓ |

Gap: catálogos/costos sin PreAuthorize fino.
