---
id: api-catalogos
title: Endpoints Catálogos
module: 06_API
layer: api
status: active
owner: backend
generated: 2026-07-13
version: "1.0.0"
depends_on: [api-index]
related_modules: [lineas-negocio, materiales, proveedores, vehiculos, tipos-costo]
tags: [api, catalogos]
when_to_update: Cambios en controllers de catálogo
source_paths:
  - backend/src/main/java/com/rycapp/interfaces/rest/controller/
---

# Catálogos

Authz: autenticado (sin `@PreAuthorize` específico) salvo nota.

## `/api/lineas-negocio`

POST `/`, PUT `/<built-in function id>`, PATCH `/<built-in function id>/estado`, GET `/`, GET `/<built-in function id>`

## `/api/materiales`

POST `/`, PUT `/<built-in function id>`, GET `/`, GET `/<built-in function id>`

## `/api/proveedores`

POST `/`, PUT `/<built-in function id>`, GET `/`, GET `/<built-in function id>`

## `/api/tipos-costo`

POST `/`, PUT `/<built-in function id>`, GET `/`, GET `/<built-in function id>`

## `/api/vehiculos`

POST `/`, PUT `/<built-in function id>`, GET `/`, GET `/<built-in function id>`

DTOs: `interfaces/rest/dto/` por recurso.
