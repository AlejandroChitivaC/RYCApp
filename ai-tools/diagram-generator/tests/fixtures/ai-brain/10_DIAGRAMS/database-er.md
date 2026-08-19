---
id: diagram-database-er
title: ER
---

```mermaid
erDiagram
  Rol ||--o{ Usuario : FK
  Usuario ||--o{ Ticket : FK
  Ticket ||--|| Ticket_Contenido : FK
```
