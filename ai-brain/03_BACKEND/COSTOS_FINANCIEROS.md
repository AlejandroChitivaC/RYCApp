---
id: backend-costos-financieros
title: Costos financieros y otros gastos
module: 03_BACKEND
layer: backend
status: active
owner: backend
generated: 2026-07-13
version: "1.0.0"
depends_on: [architecture-modules]
related_entities: []
related_modules: [costos-financieros]
tags: [backend, module]
when_to_update: Cambios en CostoFinancieroOtrosGastosService / CostoFinancieroOtrosGastosController / ports
source_paths:
  - backend/src/main/java/com/rycapp/application/service/CostoFinancieroOtrosGastosService.java
  - backend/src/main/java/com/rycapp/interfaces/rest/controller/CostoFinancieroOtrosGastosController.java
---

# Costos financieros y otros gastos

## Objetivo

Crear, listar, obtener.

## Responsabilidades

- Orquestar casos de uso del módulo vía `CostoFinancieroOtrosGastosService`.
- Exponer API REST en `/api/costos-financieros` (`CostoFinancieroOtrosGastosController`).
- Aplicar validaciones/reglas documentadas en `02_DOMAIN/BUSINESS_RULES.md`.

## Servicios

| Clase | Rol |
|-------|-----|
| `CostoFinancieroOtrosGastosService` | Application service |

## Casos de uso

Port / contrato: `CostoFinancieroOtrosGastosUseCase`.

## Dependencias

CostoFinancieroOtrosGastosRepository

## Entidades

CostoFinancieroOtrosGastos

## Eventos

ninguno

## Riesgos

Sin fechas inicio/fin; sin UI

## Futuras extensiones

Pantallas costos

## Evolución

Actualizar este archivo y `06_API`, `11_METADATA` al cambiar endpoints o reglas del módulo.
