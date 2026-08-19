---
id: security-audit
title: Auditoría
module: 07_SECURITY
layer: security
status: active
owner: security
generated: 2026-07-13
version: "1.0.0"
depends_on: [domain-entities]
related_modules: [tickets]
tags: [audit]
when_to_update: Nuevas tablas/acciones de auditoría
source_paths:
  - backend/src/main/resources/db/migration/V6__tickets.sql
  - backend/src/main/java/com/rycapp/application/service/TicketService.java
---

# AUDIT.md

## Implementado

- **Ticket_Auditoria**: acciones CARGA, CONSULTA, VISUALIZACION, DESCARGA con usuario y fecha.
- Logs aplicación: Siigo health/consulta (SLF4J).

## No implementado

- Audit trail genérico de CRUD catálogos/operaciones/costos.
- Login audit table.
- SIEM / correlación.

Pendiente de definición funcional para auditoría transversal.
