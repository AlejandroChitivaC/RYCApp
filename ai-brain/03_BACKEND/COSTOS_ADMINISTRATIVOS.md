---
id: backend-costos-administrativos
title: Costos administrativos
module: 03_BACKEND
layer: backend
status: active
owner: backend
generated: 2026-07-13
version: "1.0.0"
depends_on: [architecture-modules]
related_entities: []
related_modules: [costos-administrativos]
tags: [backend, module]
when_to_update: Cambios en CostoAdministrativoService / CostoAdministrativoController / ports
source_paths:
  - backend/src/main/java/com/rycapp/application/service/CostoAdministrativoService.java
  - backend/src/main/java/com/rycapp/interfaces/rest/controller/CostoAdministrativoController.java
---

# Costos administrativos

## Objetivo

Crear, listar, obtener.

## Responsabilidades

- Orquestar casos de uso del módulo vía `CostoAdministrativoService`.
- Exponer API REST en `/api/costos-administrativos` (`CostoAdministrativoController`).
- Aplicar validaciones/reglas documentadas en `02_DOMAIN/BUSINESS_RULES.md`.

## Servicios

| Clase | Rol |
|-------|-----|
| `CostoAdministrativoService` | Application service |

## Casos de uso

Port / contrato: `CostoAdministrativoUseCase`.

## Dependencias

CostoAdministrativoRepository

## Entidades

CostoAdministrativo

## Eventos

ninguno

## Riesgos

Sin UI frontend

## Futuras extensiones

Pantallas costos

## Evolución

Actualizar este archivo y `06_API`, `11_METADATA` al cambiar endpoints o reglas del módulo.
