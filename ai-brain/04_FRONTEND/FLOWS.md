---
id: frontend-flows
title: Flujos de UI
module: 04_FRONTEND
layer: frontend
status: active
owner: frontend
generated: 2026-07-13
version: "1.0.0"
depends_on: [domain-workflows, frontend-pages]
related_modules: []
tags: [flows, ux]
when_to_update: Cambios de journey en pages auth/tickets/usuarios
source_paths:
  - frontend/src/features/
---

# FLOWS.md

1. **Auth:** login / registro / OTP / recuperación (steppers).
2. **Dashboard:** cards de conteos (incluye `/api/tipos-costo` sin feature propia).
3. **CRUD catálogos:** lista + toolbar + modal form (líneas, usuarios, materiales, proveedores, vehículos).
4. **Activación usuarios (admin):** pendientes → asignar rol Conductor/Contador.
5. **Operaciones:** alta con dependencias de catálogo + filtros.
6. **Historial:** Admin/Contador read-only.
7. **Tickets:** carga (Admin/Conductor), consulta/PDF (Admin/Contador), auditoría (Admin).
8. **Siigo:** health + consulta + activity log sessionStorage.

Alineados con `02_DOMAIN/WORKFLOWS.md`.
