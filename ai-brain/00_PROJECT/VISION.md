---
id: project-vision
title: Visión del producto
module: 00_PROJECT
layer: project
status: inferred
owner: product
generated: 2026-07-13
version: "1.0.0"
depends_on: [project-overview]
related_entities: []
related_modules: [backend, frontend, siigo]
tags: [vision, product]
when_to_update: Cambios de estrategia de producto o alcance funcional documentado
source_paths:
  - frontend/index.html
  - frontend/src/app/config.ts
  - backend/src/main/resources/application.yml
---

# VISION.md

## Visión inferida (desde código)

Proveer un **portal operativo** para R&C Transportes que centralice:

1. Identidad y control de acceso por rol.
2. Maestros operativos (líneas, flota, materiales, proveedores, personal).
3. Captura de operaciones y costos asociados.
4. Evidencia documental (tickets) trazable.
5. Puente gradual hacia el ecosistema contable **Siigo** (hoy solo verificación de cuenta).

## Visión explícita de negocio

**Pendiente de definición funcional** — no existe documento de visión/producto en el repositorio.

## Dirección técnica observable

- Backend como sistema de registro (CRUD + workflows de auth/tickets).
- Frontend como portal único autenticado.
- Integraciones externas detrás de puertos hexagonales (`SiigoAuthPort`, `SiigoQueryPort`, `PdfConversionPort`).

## No-objetivos actuales (evidencia de ausencia)

- Facturación electrónica / escritura en Siigo.
- Módulo de clientes como bounded context.
- App móvil nativa.
- Contenedorización Docker.

## Evolución

Actualizar cuando exista un documento de producto oficial o cambie el alcance de Siigo más allá de health/consulta.
