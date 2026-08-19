---
id: backend-nomina
title: Nómina
module: 03_BACKEND
layer: backend
status: active
owner: backend
generated: 2026-07-13
version: "1.0.0"
depends_on: [architecture-modules]
related_entities: []
related_modules: [nomina]
tags: [backend, module]
when_to_update: Cambios en NominaService / NominaController / ports
source_paths:
  - backend/src/main/java/com/rycapp/application/service/NominaService.java
  - backend/src/main/java/com/rycapp/interfaces/rest/controller/NominaController.java
---

# Nómina

## Objetivo

Crear, listar, obtener.

## Responsabilidades

- Orquestar casos de uso del módulo vía `NominaService`.
- Exponer API REST en `/api/nominas` (`NominaController`).
- Aplicar validaciones/reglas documentadas en `02_DOMAIN/BUSINESS_RULES.md`.

## Servicios

| Clase | Rol |
|-------|-----|
| `NominaService` | Application service |

## Casos de uso

Port / contrato: `NominaUseCase`.

## Dependencias

NominaRepository

## Entidades

Nomina

## Eventos

ninguno

## Riesgos

Sin UI frontend

## Futuras extensiones

Pantallas costos

## Evolución

Actualizar este archivo y `06_API`, `11_METADATA` al cambiar endpoints o reglas del módulo.
