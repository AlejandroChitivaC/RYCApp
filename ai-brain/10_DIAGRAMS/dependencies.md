---
id: diagram-dependencies
title: Dependencias módulos
module: 10_DIAGRAMS
layer: diagrams
status: active
owner: architecture
generated: 2026-07-13
version: "1.0.0"
depends_on: [architecture-dependencies]
related_modules: []
tags: [dependencies, mermaid]
---

# Dependencias

```mermaid
flowchart LR
  Auth --> Usuarios
  Usuarios --> Roles
  Vehiculos --> Usuarios
  Operaciones --> Usuarios
  Operaciones --> Lineas
  Operaciones --> Vehiculos
  Operaciones --> Materiales
  Operaciones --> Proveedores
  Tickets --> Operaciones
  Tickets --> PDF
  Nominas --> TiposCosto
  Nominas --> Usuarios
  Siigo --> ExtSiigo[Siigo API]
```
