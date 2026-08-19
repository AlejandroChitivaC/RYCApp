---
id: domain-entities
title: Entidades de dominio
module: 02_DOMAIN
layer: domain
status: active
owner: domain
generated: 2026-07-13
version: "1.0.0"
depends_on: [domain-model]
related_entities: [Usuario, Rol, Vehiculo, LineaNegocio, Material, Proveedor, TipoCosto, Operacion, Nomina, CostoAdministrativo, CostoVehiculo, CostoFinancieroOtrosGastos, Ticket, TicketAuditoria, UsuarioPendienteActivacion]
related_modules: []
tags: [entities]
when_to_update: Cambio de campos en domain/model
source_paths:
  - backend/src/main/java/com/rycapp/domain/model/
---

# ENTITIES.md

Todas en `backend/src/main/java/com/rycapp/domain/model/` salvo nota.

| Entidad | Campos | Notas |
|---------|--------|-------|
| **Usuario** | id, rolId, cedula, nombre, apellido, estado | FK lógica a Rol |
| **UsuarioPendienteActivacion** | id, cedula, nombre, apellido, correo | Vista para admin |
| **UsuarioEstados** | constantes | ACTIVO, INACTIVO, PENDIENTE_APROBACION |
| **Rol** | id, descripcion | Seeded |
| **Vehiculo** | id, placa, clase, marca, modelo, estado, conductorId | conductorId opcional |
| **LineaNegocio** | id, lineaNegocio, descripcion, estado | |
| **Material** | id, material, descripcion | |
| **Proveedor** | id, nombre, nit, departamento, municipio, descripcion | |
| **TipoCosto** | id, tipoCosto, flujo, descripcion, estado | |
| **Operacion** | id, usuarioRegistroId, lineaNegocioId, vehiculoId, materialId, proveedorId, fechaInsercion, fechaInicio, fechaFin, medioPago, valor, descripcion | |
| **Nomina** | id, usuarioRegistroId, tipoCostoId, usuarioDebitadoId, fechas, medioPago, valor, descripcion | |
| **CostoAdministrativo** | id, usuarioRegistroId, tipoCostoId, fechas, medioPago, valor, descripcion | |
| **CostoVehiculo** | + vehiculoId, motivo | |
| **CostoFinancieroOtrosGastos** | sin fechas inicio/fin | |
| **Ticket** | id, operacionId, usuarioCargaId, numeroTicket, nombreArchivoOriginal, hashSha256, tipoContenidoOriginal, tamanoBytesOriginal, fechaCarga | |
| **TicketAuditoria** | id, ticketId, usuarioId, usuarioNombre, usuarioApellido, fechaAccion, accion | |

## No-entidades de dominio (infra)

- `CuentaAutenticacionEntity` — correo, passwordHash, flags verificación, OTP hashes/expiración, reset OTP.
- `Ticket_Contenido` — LONGBLOB PDF.
