---
id: backend-vehiculos
title: Flota / vehículos
module: 03_BACKEND
layer: backend
status: active
owner: backend
generated: 2026-07-13
version: "1.0.0"
depends_on: [architecture-modules]
related_entities: []
related_modules: [vehiculos]
tags: [backend, module]
when_to_update: Cambios en VehiculoService / VehiculoController / ports
source_paths:
  - backend/src/main/java/com/rycapp/application/service/VehiculoService.java
  - backend/src/main/java/com/rycapp/interfaces/rest/controller/VehiculoController.java
---

# Flota / vehículos

## Objetivo

CRUD + validación conductor.

## Responsabilidades

- Orquestar casos de uso del módulo vía `VehiculoService`.
- Exponer API REST en `/api/vehiculos` (`VehiculoController`).
- Aplicar validaciones/reglas documentadas en `02_DOMAIN/BUSINESS_RULES.md`.

## Servicios

| Clase | Rol |
|-------|-----|
| `VehiculoService` | Application service |

## Casos de uso

Port / contrato: `VehiculoUseCase`.

## Dependencias

VehiculoRepository, UsuarioRepository

## Entidades

Vehiculo, Usuario

## Eventos

ninguno

## Riesgos

1:1 conductor; estado preservado en edit

## Futuras extensiones

Cambio estado dedicado: Pendiente de definición funcional

## Evolución

Actualizar este archivo y `06_API`, `11_METADATA` al cambiar endpoints o reglas del módulo.
