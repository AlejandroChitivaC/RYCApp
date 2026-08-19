---
id: database-indexes
title: Índices
module: 05_DATABASE
layer: data
status: active
owner: data
generated: 2026-07-13
version: "1.0.0"
depends_on: [database-physical]
related_modules: []
tags: [database, indexes]
when_to_update: Nuevos KEY/UNIQUE en SQL
source_paths:
  - backend/src/main/resources/db/migration/
---

# INDEXES.md

| Tabla | Índice | Tipo |
|-------|--------|------|
| Usuario | uk_usuario_cedula | UNIQUE |
| Usuario | ix_usuario_rol | KEY |
| Vehiculo | uk_vehiculo_placa | UNIQUE |
| Vehiculo | ID_Conductor | UNIQUE (V3) |
| Linea_Negocio | uk_linea_negocio_nombre | UNIQUE |
| Proveedor | uk_proveedor_nit | UNIQUE |
| Operaciones_Lineas_Negocio | ix_op_linea, ix_op_fecha_ins | KEY |
| Cuenta_Autenticacion | UK usuario, UK correo | UNIQUE |
| Ticket | UK hash, UK número (si aplica), ix operacion/fecha | UNIQUE/KEY |
| Ticket_Auditoria | ix ticket, fecha | KEY |

Lista exhaustiva de nombres en V6: consultar `V6__tickets.sql` al regenerar.
