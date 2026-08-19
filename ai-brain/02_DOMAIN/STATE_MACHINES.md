---
id: domain-state-machines
title: Máquinas de estado
module: 02_DOMAIN
layer: domain
status: active
owner: domain
generated: 2026-07-13
version: "1.0.0"
depends_on: [domain-business-rules]
related_entities: [Usuario, LineaNegocio, TipoCosto, Vehiculo, Ticket]
related_modules: []
tags: [state-machines]
when_to_update: Nuevos estados o transiciones en servicios
source_paths:
  - backend/src/main/java/com/rycapp/domain/model/UsuarioEstados.java
  - backend/src/main/java/com/rycapp/application/service/
---

# STATE_MACHINES.md

## Usuario.estado

Estados: `PENDIENTE_APROBACION` | `ACTIVO` | `INACTIVO`

```
[Registro] → PENDIENTE_APROBACION
PENDIENTE_APROBACION --(admin activar)--> ACTIVO
ACTIVO <-> INACTIVO  (edición admin; valoresParaEdicion permite los tres)
```

Restricciones adicionales en login: además de `ACTIVO`, correo debe estar verificado (flag en cuenta, no en `Usuario.estado`).

## LineaNegocio.estado / TipoCosto.estado

- Creación → `ACTIVO`.
- Línea: cambio vía PATCH `/estado`.
- Transiciones permitidas exactas: **Pendiente de definición funcional** (servicio acepta cambio de estado; catálogo cerrado de valores no tipado en dominio salvo uso de ACTIVO).

## Vehiculo.estado

- Creación fuerza `ACTIVO`.
- Update **no** modifica estado (se preserva).
- Transición a otros estados: **Pendiente de definición funcional** (no hay endpoint dedicado observado).

## Ticket

Sin máquina de estado de ciclo de vida; es inmutable post-carga salvo auditoría append-only.

## TicketAuditoria.accion

Valores observados: `CARGA`, `CONSULTA`, `VISUALIZACION`, `DESCARGA` (no es estado del ticket; es evento).
