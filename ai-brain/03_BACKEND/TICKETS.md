---
id: backend-tickets
title: Tickets / evidencia documental
module: 03_BACKEND
layer: backend
status: active
owner: backend
generated: 2026-07-13
version: "1.0.0"
depends_on: [architecture-modules]
related_entities: []
related_modules: [tickets]
tags: [backend, module]
when_to_update: Cambios en TicketService / TicketController / ports
source_paths:
  - backend/src/main/java/com/rycapp/application/service/TicketService.java
  - backend/src/main/java/com/rycapp/interfaces/rest/controller/TicketController.java
---

# Tickets / evidencia documental

## Objetivo

Carga multipart, listado, PDF, auditoría.

## Responsabilidades

- Orquestar casos de uso del módulo vía `TicketService`.
- Exponer API REST en `/api/tickets` (`TicketController`).
- Aplicar validaciones/reglas documentadas en `02_DOMAIN/BUSINESS_RULES.md`.

## Servicios

| Clase | Rol |
|-------|-----|
| `TicketService` | Application service |

## Casos de uso

Port / contrato: `TicketUseCase`.

## Dependencias

TicketRepository, PdfConversionPort

## Entidades

Ticket, TicketAuditoria

## Eventos

auditoría append-only (no domain event bus)

## Riesgos

Límites mime/tamaño; RBAC estricto

## Futuras extensiones

OCR/validación contenido: Pendiente de definición funcional

## Evolución

Actualizar este archivo y `06_API`, `11_METADATA` al cambiar endpoints o reglas del módulo.
