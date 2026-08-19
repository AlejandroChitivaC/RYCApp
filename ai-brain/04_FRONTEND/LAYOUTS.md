---
id: frontend-layouts
title: Layouts
module: 04_FRONTEND
layer: frontend
status: active
owner: frontend
generated: 2026-07-13
version: "1.0.0"
depends_on: [frontend-index]
related_modules: []
tags: [layouts]
when_to_update: Cambios en AppLayout o AuthSplitLayout
source_paths:
  - frontend/src/app/shell/AppLayout.tsx
  - frontend/src/features/auth/components/AuthSplitLayout.tsx
---

# LAYOUTS.md

| Layout | Uso |
|--------|-----|
| `AuthSplitLayout` | Páginas públicas auth (login, registro, OTP, recuperación) |
| `AppLayout` | Shell autenticado: Sidebar + Topbar + Outlet |

Brand: Barlow font; tokens Tailwind `brand-*`.
