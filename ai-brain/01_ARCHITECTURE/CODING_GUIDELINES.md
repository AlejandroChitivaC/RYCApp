---
id: architecture-coding-guidelines
title: Guías de coding derivadas del código
module: 01_ARCHITECTURE
layer: architecture
status: active
owner: architecture
generated: 2026-07-13
version: "1.0.0"
depends_on: [architecture-overview]
related_modules: []
tags: [guidelines, conventions]
when_to_update: Cambios consistentes de estilo en el codebase
source_paths:
  - backend/src/main/java/com/rycapp/
  - frontend/src/
---

# CODING_GUIDELINES.md

Convenciones **observadas** (no un style guide formal del repo).

## Backend

1. Nuevos casos de uso: interface en `ports.in` + `@Service` en `application.service`.
2. Persistencia: port en `ports.out` + `*RepositoryAdapter` + Entity JPA + Mapper.
3. Dominio: preferir `record` inmutable; sin anotaciones Spring/JPA en domain.
4. Controllers delgados: validación Bean Validation en DTOs; mapear a use case.
5. Errores de negocio: excepciones de `application.exception` (o `IllegalArgumentException`); dejar que `GlobalExceptionHandler` responda.
6. Seguridad sensible: `@PreAuthorize` con authorities `ROLE_*`.
7. Schema: nueva migración Flyway `Vn__descripcion.sql`; no confiar en `ddl-auto` (validate).
8. Naming tablas: respetar PascalCase existente.

## Frontend

1. Nueva capacidad: carpeta `features/<nombre>/` con `api.ts`, `types.ts`, `store.ts`, `pages/`, `components/`.
2. Rutas en `app/router.tsx`; nav en `app/shell/nav.tsx`.
3. HTTP solo vía `httpClient`; mensajes de error con `apiError.ts` + Notiflix.
4. Guards: `RequireAuth` / `RequireRole` con constantes de `roles.ts`.
5. UI reutilizable en `shared/ui`; no inventar otro design system.
6. Idioma: español en copy y rutas.

## General

- No inventar capas nuevas sin ADR.
- No acoplar frontend a detalles JPA.
- Credenciales solo por env / `application-local.yml` (gitignored).

## Evolución

Si el equipo publica un CONTRIBUTING, reemplazar secciones conflictivas y referenciarlo aquí.
