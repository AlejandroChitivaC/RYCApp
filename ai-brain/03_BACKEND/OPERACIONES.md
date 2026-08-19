---
id: backend-operaciones
title: Operaciones de líneas de negocio
module: 03_BACKEND
layer: backend
status: active
owner: backend
generated: 2026-07-13
version: "1.0.0"
depends_on: [architecture-modules]
related_entities: []
related_modules: [operaciones]
tags: [backend, module]
when_to_update: Cambios en OperacionService / OperacionController / ports
source_paths:
  - backend/src/main/java/com/rycapp/application/service/OperacionService.java
  - backend/src/main/java/com/rycapp/interfaces/rest/controller/OperacionController.java
---

# Operaciones de líneas de negocio

## Objetivo

Crear, listar/filtrar, historial, obtener.

## Responsabilidades

- Orquestar casos de uso del módulo vía `OperacionService`.
- Exponer API REST en `/api/operaciones` (`OperacionController`).
- Aplicar validaciones/reglas documentadas en `02_DOMAIN/BUSINESS_RULES.md`.

## Servicios

| Clase | Rol |
|-------|-----|
| `OperacionService` | Application service |

## Casos de uso

Port / contrato: `OperacionUseCase`.

## Dependencias

OperacionRepository + FKs catálogo

## Entidades

Operacion

## Eventos

ninguno

## Riesgos

Historial solo ADMIN|CONTADOR

## Futuras extensiones

Edición/anulación operación: Pendiente de definición funcional

## Evolución

Actualizar este archivo y `06_API`, `11_METADATA` al cambiar endpoints o reglas del módulo.
