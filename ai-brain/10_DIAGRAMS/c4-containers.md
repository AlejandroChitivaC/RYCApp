---
id: diagram-c4-containers
title: C4 Containers
module: 10_DIAGRAMS
layer: diagrams
status: active
owner: architecture
generated: 2026-07-13
version: "1.0.0"
depends_on: [diagram-c4-context]
related_modules: []
tags: [c4, mermaid]
---

# C4 — Containers

```mermaid
flowchart TB
  Browser[Web Browser]
  SPA[Container: frontend Vite SPA]
  API[Container: rycapp-backend :8080]
  DB[(Container: MySQL)]
  Siigo[Siigo API]
  SMTP[SMTP Provider]
  Browser --> SPA
  SPA -->|REST JSON / multipart| API
  API --> DB
  API --> Siigo
  API --> SMTP
```
