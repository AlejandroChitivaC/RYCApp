---
id: frontend-stores
title: Stores Zustand
module: 04_FRONTEND
layer: frontend
status: active
owner: frontend
generated: 2026-07-13
version: "1.0.0"
depends_on: [frontend-index]
related_modules: []
tags: [stores, zustand]
when_to_update: Nuevo store.ts en features
source_paths:
  - frontend/src/features/*/store.ts
---

# STORES.md

| Store | Feature |
|-------|---------|
| `useAuthStore` | auth |
| `useUsuariosStore` | usuarios |
| `useMaterialesStore` | materiales |
| `useProveedoresStore` | proveedores |
| `useVehiculosStore` | vehiculos |
| `useLineasNegocioStore` | lineasNegocio |
| `useOperacionesStore` | operaciones |
| `useHistorialOperacionesStore` | operaciones/historialStore |
| `useTicketsStore` | tickets |

Siigo: estado local + `sessionStorage` (`logStorage.ts`). Dashboard: `useState` local.
Patrón: `items`, `isLoading`, `error`, `fetchAll`, `create`, `update`.
