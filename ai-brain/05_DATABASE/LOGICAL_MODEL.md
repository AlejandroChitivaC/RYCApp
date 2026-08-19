---
id: database-logical
title: Modelo lógico
module: 05_DATABASE
layer: data
status: active
owner: data
generated: 2026-07-13
version: "1.0.0"
depends_on: [domain-model]
related_entities: []
related_modules: []
tags: [database, logical]
when_to_update: Cambios ER en migraciones
source_paths:
  - backend/src/main/resources/db/migration/
---

# LOGICAL_MODEL.md

Entidades lógicas alineadas al dominio + cuenta y contenido de ticket:

Rol, Usuario, Cuenta_Autenticacion, Vehiculo, Linea_Negocio, Material, Proveedor, Tipo_Costo,
Operaciones_Lineas_Negocio, Nomina, Costo_Administrativo, Costo_Vehiculo, Costo_Financiero_OtrosGastos,
Ticket, Ticket_Contenido, Ticket_Auditoria.

Ver diagramas ER en `10_DIAGRAMS/database-er.md`.
