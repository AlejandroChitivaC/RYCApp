---
id: backend-siigo
title: Conexión Siigo (backend module)
module: 03_BACKEND
layer: backend
status: active
owner: backend
generated: 2026-07-13
version: "1.0.0"
depends_on: [architecture-modules]
related_entities: []
related_modules: [siigo]
tags: [backend, module]
when_to_update: Cambios en SiigoConnectionService / SiigoController / ports
source_paths:
  - backend/src/main/java/com/rycapp/application/service/SiigoConnectionService.java
  - backend/src/main/java/com/rycapp/interfaces/rest/controller/SiigoController.java
---

# Conexión Siigo (backend module)

## Objetivo

Health + consulta cuenta.

## Responsabilidades

- Orquestar casos de uso del módulo vía `SiigoConnectionService`.
- Exponer API REST en `/api/siigo` (`SiigoController`).
- Aplicar validaciones/reglas documentadas en `02_DOMAIN/BUSINESS_RULES.md`.

## Servicios

| Clase | Rol |
|-------|-----|
| `SiigoConnectionService` | Application service |

## Casos de uso

Port / contrato: `SiigoConnectionUseCase`.

## Dependencias

SiigoAuthPort, SiigoQueryPort

## Entidades

— (sin entidad dominio)

## Eventos

ninguno

## Riesgos

Solo lectura verificación

## Futuras extensiones

Ver 08_INTEGRATIONS/SIIGO.md

## Evolución

Actualizar este archivo y `06_API`, `11_METADATA` al cambiar endpoints o reglas del módulo.
