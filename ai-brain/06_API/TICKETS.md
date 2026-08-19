---
id: api-tickets
title: Endpoints Tickets
module: 06_API
layer: api
status: active
owner: backend
generated: 2026-07-13
version: "1.0.0"
depends_on: [api-index]
related_modules: [tickets]
tags: [api, tickets]
when_to_update: Cambios TicketController
source_paths:
  - backend/src/main/java/com/rycapp/interfaces/rest/controller/TicketController.java
---

# TICKETS — `/api/tickets`

| Método | Path | Authz | Request/Notes | Response |
|--------|------|-------|---------------|----------|
| POST | `/` | ROLE_ADMIN \| ROLE_CONDUCTOR | multipart: operacionId, numeroTicket?, archivo | TicketResponse |
| GET | `/` | ROLE_ADMIN \| ROLE_CONTADOR | ?operacionId | lista |
| GET | `/<built-in function id>` | ROLE_ADMIN \| ROLE_CONTADOR | — | TicketResponse |
| GET | `/<built-in function id>/pdf` | ROLE_ADMIN \| ROLE_CONTADOR | ?disposition=attachment\|inline | PDF bytes |
| GET | `/auditoria` | ROLE_ADMIN | — | TicketAuditoriaResponse[] |
| GET | `/<built-in function id>/auditoria` | ROLE_ADMIN | — | auditoría |
