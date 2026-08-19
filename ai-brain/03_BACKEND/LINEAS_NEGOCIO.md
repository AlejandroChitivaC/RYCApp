---
id: backend-lineas-negocio
title: Líneas de negocio
module: 03_BACKEND
layer: backend
status: active
owner: backend
generated: 2026-07-13
version: "1.0.0"
depends_on: [architecture-modules]
related_entities: []
related_modules: [lineas-negocio]
tags: [backend, module]
when_to_update: Cambios en LineaNegocioService / LineaNegocioController / ports
source_paths:
  - backend/src/main/java/com/rycapp/application/service/LineaNegocioService.java
  - backend/src/main/java/com/rycapp/interfaces/rest/controller/LineaNegocioController.java
---

# Líneas de negocio

## Objetivo

CRUD + cambio estado.

## Responsabilidades

- Orquestar casos de uso del módulo vía `LineaNegocioService`.
- Exponer API REST en `/api/lineas-negocio` (`LineaNegocioController`).
- Aplicar validaciones/reglas documentadas en `02_DOMAIN/BUSINESS_RULES.md`.

## Servicios

| Clase | Rol |
|-------|-----|
| `LineaNegocioService` | Application service |

## Casos de uso

Port / contrato: `LineaNegocioUseCase`.

## Dependencias

LineaNegocioRepository

## Entidades

LineaNegocio

## Eventos

ninguno

## Riesgos

Nombre único; ACTIVO al crear

## Futuras extensiones

—

## Evolución

Actualizar este archivo y `06_API`, `11_METADATA` al cambiar endpoints o reglas del módulo.
