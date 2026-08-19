---
id: domain-model
title: Modelo de dominio
module: 02_DOMAIN
layer: domain
status: active
owner: domain
generated: 2026-07-13
version: "1.0.0"
depends_on: [project-glossary]
related_entities: [Usuario, Rol, Vehiculo, LineaNegocio, Material, Proveedor, TipoCosto, Operacion, Nomina, CostoAdministrativo, CostoVehiculo, CostoFinancieroOtrosGastos, Ticket, TicketAuditoria]
related_modules: [02_DOMAIN]
tags: [ddd, domain-model]
when_to_update: Cambio en domain/model o relaciones FK
source_paths:
  - backend/src/main/java/com/rycapp/domain/model/
---

# DOMAIN_MODEL.md

## Estilo DDD aplicado

- **Ubiquitous language:** español en nombres de negocio (ver GLOSSARY).
- **Entities:** modeladas como Java `record` (identidad por `id`).
- **Aggregates ricos / Domain services / Domain events:** no presentes.
- **CuentaAutenticacion:** concepto de infraestructura, no en `domain.model`.

## Diagrama lógico (texto)

```
Rol 1──* Usuario
Usuario 1──0..1 Vehiculo (como conductor)
Usuario *──* Operacion (como registrador)
LineaNegocio, Vehiculo, Material, Proveedor ──► Operacion
Operacion 1──* Ticket
Ticket 1──* TicketAuditoria
Ticket 1──1 Ticket_Contenido (persistencia; no domain record)
TipoCosto ──► Nomina | CostoAdministrativo | CostoVehiculo | CostoFinancieroOtrosGastos
Usuario ──► Costos/Nómina (registrador; + debitado en Nómina)
Vehiculo ──► CostoVehiculo
```

## Catálogo de tipos de dominio

| Categoría | Tipos |
|-----------|-------|
| Identidad | Usuario, Rol, UsuarioPendienteActivacion, UsuarioEstados |
| Maestros | LineaNegocio, Material, Proveedor, TipoCosto, Vehiculo |
| Transacciones operativas | Operacion |
| Transacciones de costo | Nomina, CostoAdministrativo, CostoVehiculo, CostoFinancieroOtrosGastos |
| Documentos | Ticket, TicketAuditoria |

Detalle de campos: `ENTITIES.md`.
