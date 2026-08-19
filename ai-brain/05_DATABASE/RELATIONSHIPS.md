---
id: database-relationships
title: Relaciones FK
module: 05_DATABASE
layer: data
status: active
owner: data
generated: 2026-07-13
version: "1.0.0"
depends_on: [database-physical]
related_modules: []
tags: [database, fk]
when_to_update: Nuevas FK en migraciones
source_paths:
  - backend/src/main/resources/db/migration/
---

# RELATIONSHIPS.md

| Hijo | FK | Padre |
|------|----|-------|
| Usuario.ID_Rol | fk_usuario_rol | Rol |
| Cuenta_Autenticacion → Usuario | 1:1 | Usuario |
| Vehiculo.ID_Conductor | UK+FK | Usuario |
| Operaciones_Lineas_Negocio | usuario, linea, vehiculo, material, proveedor | respectivos |
| Nomina | reg, tipo, debitado | Usuario, Tipo_Costo, Usuario |
| Costo_Administrativo | usuario, tipo | Usuario, Tipo_Costo |
| Costo_Vehiculo | usuario, tipo, vehiculo | Usuario, Tipo_Costo, Vehiculo |
| Costo_Financiero_OtrosGastos | usuario, tipo | Usuario, Tipo_Costo |
| Ticket | operacion, usuario carga | Operaciones_Lineas_Negocio, Usuario |
| Ticket_Contenido | PK=FK ticket | Ticket |
| Ticket_Auditoria | ticket, usuario | Ticket, Usuario |
