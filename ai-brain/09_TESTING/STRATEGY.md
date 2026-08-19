---
id: testing-strategy
title: Estrategia de testing
module: 09_TESTING
layer: quality
status: gap
owner: quality
generated: 2026-07-13
version: "1.0.0"
depends_on: [project-overview]
related_modules: []
tags: [testing]
when_to_update: Cuando existan tests reales
source_paths:
  - backend/pom.xml
  - frontend/package.json
---

# STRATEGY.md

## Estado actual (evidencia)

| Área | Estado |
|------|--------|
| Backend `src/test` | **No encontrado** (starters test en pom) |
| Frontend scripts test / Vitest / Jest | **No encontrado** |
| E2E | **No encontrado** |
| CI test stage | Workflow deploy no ejecuta suite de tests unitarios explícita más allá del build Maven |

## Estrategia recomendada (propuesta documental — no implementada)

**Pendiente de definición funcional** oficial. Sugerencia alineada a arquitectura:

1. Unit: services + PasswordPolicy + mappers.
2. Slice: `@WebMvcTest` controllers + security.
3. Integration: `@SpringBootTest` + Testcontainers MySQL + Flyway.
4. Frontend: Vitest componentes críticos + Playwright smoke auth.

Hasta existir política oficial, marcar cobertura objetivo como pendiente.
