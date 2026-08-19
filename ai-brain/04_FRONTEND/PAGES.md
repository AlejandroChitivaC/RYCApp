---
id: frontend-pages
title: Pages y rutas
module: 04_FRONTEND
layer: frontend
status: active
owner: frontend
generated: 2026-07-13
version: "1.0.0"
depends_on: [frontend-index]
related_modules: []
tags: [pages, routes]
when_to_update: Cambios en app/router.tsx
source_paths:
  - frontend/src/app/router.tsx
---

# PAGES.md

Fuente: `frontend/src/app/router.tsx`.

## Públicas

| Ruta | Page |
|------|------|
| `/login` | LoginPage |
| `/registro` | RegisterPage |
| `/verificar-correo` | VerifyEmailPage |
| `/recuperar-contrasena` | ForgotPasswordPage |

## Protegidas (RequireAuth + AppLayout)

| Ruta | Page | Guard extra |
|------|------|-------------|
| `/` | redirect `/dashboard` | — |
| `/dashboard` | DashboardPage | — |
| `/lineas-negocio` | LineasNegocioPage | — |
| `/usuarios` | UsuariosPage | — |
| `/materiales` | MaterialesPage | — |
| `/proveedores` | ProveedoresPage | — |
| `/vehiculos` | VehiculosPage | — |
| `/operaciones` | OperacionesPage | — |
| `/historial-operaciones` | HistorialOperacionesPage | Admin, Contador |
| `/tickets` | TicketsPage | Admin, Conductor, Contador |
| `/siigo` | SiigoConnectionPage | Administrador |

Nav espejo: `app/shell/nav.tsx`.
