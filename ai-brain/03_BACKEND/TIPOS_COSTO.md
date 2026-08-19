---
id: backend-tipos-costo
title: Tipos de costo
module: 03_BACKEND
layer: backend
status: active
owner: backend
generated: 2026-07-13
version: "1.0.0"
depends_on: [architecture-modules]
related_entities: []
related_modules: [tipos-costo]
tags: [backend, module]
when_to_update: Cambios en TipoCostoService / TipoCostoController / ports
source_paths:
  - backend/src/main/java/com/rycapp/application/service/TipoCostoService.java
  - backend/src/main/java/com/rycapp/interfaces/rest/controller/TipoCostoController.java
---

# Tipos de costo

## Objetivo

CRUD.

## Responsabilidades

- Orquestar casos de uso del módulo vía `TipoCostoService`.
- Exponer API REST en `/api/tipos-costo` (`TipoCostoController`).
- Aplicar validaciones/reglas documentadas en `02_DOMAIN/BUSINESS_RULES.md`.

## Servicios

| Clase | Rol |
|-------|-----|
| `TipoCostoService` | Application service |

## Casos de uso

Port / contrato: `TipoCostoUseCase`.

## Dependencias

TipoCostoRepository

## Entidades

TipoCosto

## Eventos

ninguno

## Riesgos

ACTIVO al crear; sin UI dedicada

## Futuras extensiones

Feature UI tipos-costo

## Evolución

Actualizar este archivo y `06_API`, `11_METADATA` al cambiar endpoints o reglas del módulo.
