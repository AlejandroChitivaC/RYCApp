---
id: database-constraints
title: Restricciones
module: 05_DATABASE
layer: data
status: active
owner: data
generated: 2026-07-13
version: "1.0.0"
depends_on: [database-relationships]
related_modules: []
tags: [database, constraints]
when_to_update: Cambios NOT NULL/UNIQUE/FK
source_paths:
  - backend/src/main/resources/db/migration/
---

# CONSTRAINTS.md

- PKs AUTO_INCREMENT BIGINT en tablas principales.
- NOT NULL en campos de negocio críticos (cédula, placa, valor, medio_pago, etc.).
- UNIQUE: cédula, placa, NIT, nombre línea, hash ticket, correo cuenta.
- FK RESTRICT default InnoDB (sin ON DELETE CASCADE explícito en V1).
- DECIMAL(14,2) para valores monetarios.
- DATETIME(3) para timestamps.
- Soft-delete: no existe.
