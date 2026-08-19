---
id: database-index
title: Base de datos
module: 05_DATABASE
layer: data
status: active
owner: data
generated: 2026-07-13
version: "1.0.0"
depends_on: [architecture-overview]
related_modules: []
tags: [database, flyway, mysql]
when_to_update: Nueva migración Flyway
source_paths:
  - backend/src/main/resources/db/migration/
  - backend/src/main/resources/application.yml
---

# Database

- Motor: MySQL 8 (`rycapp`)
- Migraciones: Flyway `classpath:db/migration`
- JPA: `ddl-auto: validate`
- Naming: `PhysicalNamingStrategyStandardImpl` (nombres físicos literales)

Documentos: LOGICAL_MODEL, PHYSICAL_MODEL, RELATIONSHIPS, INDEXES, CONSTRAINTS, DATA_DICTIONARY.
