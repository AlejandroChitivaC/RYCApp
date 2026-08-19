---
id: testing-best-practices
title: Buenas prácticas (para cuando se añadan tests)
module: 09_TESTING
layer: quality
status: guidance
owner: quality
generated: 2026-07-13
version: "1.0.0"
depends_on: [architecture-extension-guide]
related_modules: []
tags: [testing, guidance]
---

# BEST_PRACTICES.md

Derivadas de la arquitectura (aún sin suite):

1. Testear application services contra ports mockeados (hexagonal).
2. No testear solo controllers sin reglas de negocio.
3. Fixtures alineadas a migraciones Flyway.
4. Casos BR-* de BUSINESS_RULES.md como casos de prueba prioritarios.
5. Frontend: mockear `httpClient`; probar RequireRole y flujos auth error codes.
