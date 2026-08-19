---
id: diagram-c4-context
title: C4 Context
module: 10_DIAGRAMS
layer: diagrams
status: active
owner: architecture
generated: 2026-07-13
version: "1.0.0"
depends_on: [architecture-overview]
related_modules: []
tags: [c4, mermaid]
---

# C4 — System Context

```mermaid
flowchart LR
  Users[Usuarios: Admin / Contador / Conductor / Registrado]
  SPA[Frontend React SPA]
  API[Backend Spring Boot]
  DB[(MySQL rycapp)]
  Siigo[Siigo API]
  Mail[SMTP]
  Users --> SPA
  SPA -->|REST JSON / multipart| API
  API --> DB
  API --> Siigo
  API --> Mail
```
