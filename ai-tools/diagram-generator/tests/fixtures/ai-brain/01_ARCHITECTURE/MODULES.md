---
id: architecture-modules
title: Modules
---

# MODULES

| Módulo | Port in | Service | Controller | Persistencia |
|--------|---------|---------|------------|--------------|
| Auth | *(ausente)* | AuthService | AuthController | JPA cuenta |
| Tickets | TicketUseCase | TicketService | TicketController | TicketRepository |
