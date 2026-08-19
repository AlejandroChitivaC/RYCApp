---
id: domain-aggregates
title: Agregados (inferidos)
module: 02_DOMAIN
layer: domain
status: inferred
owner: domain
generated: 2026-07-13
version: "1.0.0"
depends_on: [domain-model]
related_entities: [Usuario, Operacion, Ticket, Vehiculo]
related_modules: []
tags: [ddd, aggregates]
when_to_update: Si se introducen boundaries de consistencia explícitos
source_paths:
  - backend/src/main/java/com/rycapp/application/service/
---

# AGGREGATES.md

El código **no** define aggregates DDD explícitos. Se proponen **boundaries de consistencia inferidos** por transacciones de servicio:

| Aggregate inferido | Raíz | Invariantes clave | Evidencia |
|--------------------|------|-------------------|-----------|
| Usuario (+ cuenta) | Usuario / CuentaAutenticacion | Cédula única; estado; rol; OTP en cuenta | Auth/Usuario services |
| Vehículo | Vehiculo | Placa única; conductor 1:1 opcional con rol Conductor | `VehiculoService` |
| Línea de negocio | LineaNegocio | Nombre único; estado ACTIVO al crear | `LineaNegocioService` |
| Proveedor | Proveedor | NIT único | `ProveedorService` |
| Operación | Operacion | FKs existentes; fechaInsercion now | `OperacionService` |
| Ticket | Ticket (+ contenido + auditoría) | Hash único; tipo imagen; tamaño; PDF | `TicketService` |
| Costos* | cada entidad de costo | FKs existentes | `*Costo*Service`, `NominaService` |

**Nota:** Ticket contenido y auditoría se persisten juntos operacionalmente pero son tablas separadas.

Sin aggregate roots formales ni repositorios por aggregate boundary.
