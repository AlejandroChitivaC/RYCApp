---
id: backend-costos-vehiculo
title: Costos de vehículo
module: 03_BACKEND
layer: backend
status: active
owner: backend
generated: 2026-07-13
version: "1.0.0"
depends_on: [architecture-modules]
related_entities: []
related_modules: [costos-vehiculo]
tags: [backend, module]
when_to_update: Cambios en CostoVehiculoService / CostoVehiculoController / ports
source_paths:
  - backend/src/main/java/com/rycapp/application/service/CostoVehiculoService.java
  - backend/src/main/java/com/rycapp/interfaces/rest/controller/CostoVehiculoController.java
---

# Costos de vehículo

## Objetivo

Crear, listar, obtener.

## Responsabilidades

- Orquestar casos de uso del módulo vía `CostoVehiculoService`.
- Exponer API REST en `/api/costos-vehiculo` (`CostoVehiculoController`).
- Aplicar validaciones/reglas documentadas en `02_DOMAIN/BUSINESS_RULES.md`.

## Servicios

| Clase | Rol |
|-------|-----|
| `CostoVehiculoService` | Application service |

## Casos de uso

Port / contrato: `CostoVehiculoUseCase`.

## Dependencias

CostoVehiculoRepository

## Entidades

CostoVehiculo

## Eventos

ninguno

## Riesgos

Sin UI frontend

## Futuras extensiones

Pantallas costos

## Evolución

Actualizar este archivo y `06_API`, `11_METADATA` al cambiar endpoints o reglas del módulo.
