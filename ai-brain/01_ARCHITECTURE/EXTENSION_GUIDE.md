---
id: architecture-extension-guide
title: Guía de extensión
module: 01_ARCHITECTURE
layer: architecture
status: active
owner: architecture
generated: 2026-07-13
version: "1.0.0"
depends_on: [architecture-coding-guidelines, architecture-modules]
related_modules: []
tags: [extension, how-to]
when_to_update: Cambios en el patrón de módulos
source_paths:
  - backend/src/main/java/com/rycapp/
  - frontend/src/features/
---

# EXTENSION_GUIDE.md

Cómo extender el sistema **respetando** la arquitectura existente. Esta guía es conocimiento; no genera código.

## A. Nueva entidad de catálogo (patrón Material/Proveedor)

### Backend

1. Record en `domain/model`.
2. `XxxUseCase` + `XxxService` con reglas (unicidad, estados).
3. `XxxRepository` (port out) + Entity + JpaRepository + Adapter + Mapper.
4. Migración Flyway.
5. DTOs + Controller bajo `/api/...`.
6. Registrar excepciones solo si hace falta (reutilizar handler).

### Frontend

1. Feature `features/xxx/` (`api`, `store`, `types`, page, form).
2. Ruta + ítem nav (+ roles si aplica).

### AIKB

Actualizar DOMAIN, BACKEND, API, DATABASE, METADATA, diagramas.

## B. Nueva Historia de Usuario — ¿dónde?

| Tipo HU | Ubicación preferente |
|---------|----------------------|
| Regla de negocio | `*Service` + tests futuros |
| Nuevo endpoint | `interfaces.rest.controller` |
| Nuevo campo persistido | Flyway + Entity + domain record + DTO |
| Nueva pantalla | `features/*/pages` |
| Nueva integración | `ports.out` + `infrastructure/<vendor>` |
| Solo autorización | `@PreAuthorize` + `roles.ts` + nav |

## C. Nueva integración externa

Seguir Siigo:

1. Properties (`app.<vendor>.*`).
2. Ports out (auth/query/command según necesidad).
3. Adapters RestClient/SDK.
4. Application service orquestador.
5. Controller con rol adecuado.
6. Documento en `08_INTEGRATIONS/`.

## D. Extender Siigo

Hoy solo verificación. Para sync/facturación: nuevos métodos en ports (no mezclar con domain de operaciones hasta haber modelo claro). Marcar ADRs.

## E. Qué no hacer

- Poner JPA en `domain`.
- Llamar Siigo desde Controllers.
- Duplicar literales de rol sin actualizar filtro JWT y `roles.ts`.
- Usar `ddl-auto: update` en lugar de Flyway.
- Crear feature frontend sin endpoint o viceversa sin documentar el gap.

## Checklist post-extensión

- [ ] Migración / API / UI alineados
- [ ] Seguridad revisada
- [ ] AIKB actualizada (`generator/REGENERATION_CHECKLIST.md`)
