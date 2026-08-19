---
id: backend-roles
title: Catálogo de roles
module: 03_BACKEND
layer: backend
status: active
owner: backend
generated: 2026-07-13
version: "1.0.0"
depends_on: [architecture-modules]
related_entities: []
related_modules: [roles]
tags: [backend, module]
when_to_update: Cambios en RolService / RolController / ports
source_paths:
  - backend/src/main/java/com/rycapp/application/service/RolService.java
  - backend/src/main/java/com/rycapp/interfaces/rest/controller/RolController.java
---

# Catálogo de roles

## Objetivo

Listar roles.

## Responsabilidades

- Orquestar casos de uso del módulo vía `RolService`.
- Exponer API REST en `/api/roles` (`RolController`).
- Aplicar validaciones/reglas documentadas en `02_DOMAIN/BUSINESS_RULES.md`.

## Servicios

| Clase | Rol |
|-------|-----|
| `RolService` | Application service |

## Casos de uso

Port / contrato: `RolUseCase`.

## Dependencias

RolRepository

## Entidades

Rol

## Eventos

ninguno

## Riesgos

Roles seeded por migraciones; no CRUD completo

## Futuras extensiones

CRUD roles: Pendiente de definición funcional

## Evolución

Actualizar este archivo y `06_API`, `11_METADATA` al cambiar endpoints o reglas del módulo.
