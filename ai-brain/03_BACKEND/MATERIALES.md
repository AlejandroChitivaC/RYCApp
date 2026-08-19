---
id: backend-materiales
title: Materiales
module: 03_BACKEND
layer: backend
status: active
owner: backend
generated: 2026-07-13
version: "1.0.0"
depends_on: [architecture-modules]
related_entities: []
related_modules: [materiales]
tags: [backend, module]
when_to_update: Cambios en MaterialService / MaterialController / ports
source_paths:
  - backend/src/main/java/com/rycapp/application/service/MaterialService.java
  - backend/src/main/java/com/rycapp/interfaces/rest/controller/MaterialController.java
---

# Materiales

## Objetivo

CRUD.

## Responsabilidades

- Orquestar casos de uso del módulo vía `MaterialService`.
- Exponer API REST en `/api/materiales` (`MaterialController`).
- Aplicar validaciones/reglas documentadas en `02_DOMAIN/BUSINESS_RULES.md`.

## Servicios

| Clase | Rol |
|-------|-----|
| `MaterialService` | Application service |

## Casos de uso

Port / contrato: `MaterialUseCase`.

## Dependencias

MaterialRepository

## Entidades

Material

## Eventos

ninguno

## Riesgos

—

## Futuras extensiones

—

## Evolución

Actualizar este archivo y `06_API`, `11_METADATA` al cambiar endpoints o reglas del módulo.
