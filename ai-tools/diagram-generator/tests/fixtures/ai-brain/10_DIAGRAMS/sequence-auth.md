---
id: diagram-sequence-auth
title: Secuencia Auth
---

# Sequence

```mermaid
sequenceDiagram
  participant UI as Frontend
  participant AC as AuthController
  UI->>AC: POST /api/auth/login
  AC-->>UI: token
```
