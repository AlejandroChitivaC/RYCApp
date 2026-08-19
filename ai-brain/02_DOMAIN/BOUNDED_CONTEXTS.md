---
id: domain-bounded-contexts
title: Bounded Contexts
module: 02_DOMAIN
layer: domain
status: inferred
owner: domain
generated: 2026-07-13
version: "1.0.0"
depends_on: [domain-model]
related_modules: []
tags: [bounded-contexts, ddd]
when_to_update: Separación real de módulos/despliegues o nuevos contextos
source_paths:
  - backend/src/main/java/com/rycapp/
---

# BOUNDED_CONTEXTS.md

El sistema es un **monolito modular**. Contextos inferidos (no hay bounded contexts formales ni módulos Maven separados):

| Contexto | Núcleo | Relaciones |
|----------|--------|------------|
| **Identity & Access** | Auth, Usuario, Rol, Cuenta | Comparte Usuario con resto |
| **Fleet & Catalog** | Vehiculo, LineaNegocio, Material, Proveedor, TipoCosto | Alimenta Operaciones/Costos |
| **Operations** | Operacion | Usa catálogos + usuario |
| **Costs** | Nomina + 3 costos | Usa TipoCosto + Usuario (+ Vehiculo) |
| **Evidence (Tickets)** | Ticket, Auditoría | Depende de Operacion |
| **External Accounting (Siigo)** | Conexión/consulta | Sin sincronización de dominio aún |

## Shared Kernel

- `Usuario` / `Rol` compartidos ampliamente.
- Formato de error API `ApiErrorResponse`.

## Context map (simplificado)

```
Identity ──shared──► Operations, Costs, Tickets, Catalog
Catalog ──upstream──► Operations, Costs
Operations ──upstream──► Tickets
Siigo ──ACL (ports)──► Identity (solo authz admin)
```
