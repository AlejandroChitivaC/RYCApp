---
id: diagram-sequence-auth
title: Secuencia Auth Login
module: 10_DIAGRAMS
layer: diagrams
status: active
owner: backend
generated: 2026-07-13
version: "1.0.0"
depends_on: [domain-workflows]
related_modules: [auth]
tags: [sequence, mermaid]
---

# Secuencia — Login

```mermaid
sequenceDiagram
  participant UI as Frontend
  participant AC as AuthController
  participant AS as AuthService
  participant DB as MySQL
  participant JWT as JwtService
  UI->>AC: POST /api/auth/login
  AC->>AS: login(credentials)
  AS->>DB: cargar cuenta/usuario/rol
  alt invalido o no verificado o pendiente
    AS-->>UI: 401/403 + code
  else OK
    AS->>JWT: generate token
    AS-->>UI: AuthLoginResponse
  end
```
