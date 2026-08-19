---
id: backend-proveedores
title: Proveedores
module: 03_BACKEND
layer: backend
status: active
owner: backend
generated: 2026-07-13
version: "1.0.0"
depends_on: [architecture-modules]
related_entities: []
related_modules: [proveedores]
tags: [backend, module]
when_to_update: Cambios en ProveedorService / ProveedorController / ports
source_paths:
  - backend/src/main/java/com/rycapp/application/service/ProveedorService.java
  - backend/src/main/java/com/rycapp/interfaces/rest/controller/ProveedorController.java
---

# Proveedores

## Objetivo

CRUD + unicidad NIT.

## Responsabilidades

- Orquestar casos de uso del módulo vía `ProveedorService`.
- Exponer API REST en `/api/proveedores` (`ProveedorController`).
- Aplicar validaciones/reglas documentadas en `02_DOMAIN/BUSINESS_RULES.md`.

## Servicios

| Clase | Rol |
|-------|-----|
| `ProveedorService` | Application service |

## Casos de uso

Port / contrato: `ProveedorUseCase`.

## Dependencias

ProveedorRepository

## Entidades

Proveedor

## Eventos

ninguno

## Riesgos

NIT único

## Futuras extensiones

—

## Evolución

Actualizar este archivo y `06_API`, `11_METADATA` al cambiar endpoints o reglas del módulo.
