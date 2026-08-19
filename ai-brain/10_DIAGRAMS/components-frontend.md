---
id: diagram-frontend-components
title: Componentes Frontend
module: 10_DIAGRAMS
layer: diagrams
status: active
owner: frontend
generated: 2026-07-13
version: "1.0.0"
depends_on: [frontend-index]
related_modules: []
tags: [frontend, mermaid]
---

# Frontend — componentes

```mermaid
flowchart TB
  Router --> Guards[RequireAuth / RequireRole]
  Guards --> AppLayout
  AppLayout --> Pages
  Pages --> Stores[Zustand Stores]
  Stores --> APIs[feature api.ts]
  APIs --> HTTP[httpClient Axios]
  Pages --> SharedUI[shared/ui]
```
