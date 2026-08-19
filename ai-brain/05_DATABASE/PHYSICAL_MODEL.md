---
id: database-physical
title: Modelo físico
module: 05_DATABASE
layer: data
status: active
owner: data
generated: 2026-07-13
version: "1.0.0"
depends_on: [database-logical]
related_modules: []
tags: [database, physical, flyway]
when_to_update: Nueva migración
source_paths:
  - backend/src/main/resources/db/migration/
---

# PHYSICAL_MODEL.md

## Migraciones

| Archivo | Contenido |
|---------|-----------|
| V1__init.sql | Núcleo ER + seeds Rol Administrador, Usuario sistema, Material/Proveedor inicial |
| V2__auth_cuenta_otp.sql | Rol «Usuario registrado»; Cuenta_Autenticacion |
| V3__vehiculo_conductor_flujo_cuentas.sql | Rol Conductor; Vehiculo.ID_Conductor |
| V4__rol_contador.sql | Rol Contador |
| V5__cuenta_reset_otp.sql | Reset_OTP_Hash, Reset_OTP_Expira |
| V6__tickets.sql | Ticket, Ticket_Contenido, Ticket_Auditoria |

Seed opcional no Flyway: `db/seed/dev_tickets_prueba.sql`.

## Engine / charset

InnoDB, utf8mb4_0900_ai_ci (V1).
