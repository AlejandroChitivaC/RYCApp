---
id: security-jwt
title: JWT
module: 07_SECURITY
layer: security
status: active
owner: security
generated: 2026-07-13
version: "1.0.0"
depends_on: [security-authentication]
related_modules: [auth]
tags: [jwt]
when_to_update: Cambios JwtService / claims
source_paths:
  - backend/src/main/java/com/rycapp/infrastructure/security/JwtService.java
  - backend/src/main/java/com/rycapp/infrastructure/security/JwtAuthenticationFilter.java
  - backend/src/main/resources/application.yml
---

# JWT.md

| Aspecto | Valor |
|---------|-------|
| Algoritmo | HS256 |
| Subject | usuarioId |
| Claims | email, nombre, apellido, rol |
| Expiración | `app.jwt.expiration-minutes` = 720 |
| Secret | `app.jwt.secret` (≥32 chars); default en YAML de desarrollo |

Mapeo rol → authorities en `JwtAuthenticationFilter`:
- siempre ROLE_USER
- Administrador → ROLE_ADMIN
- Contador → ROLE_CONTADOR
- Conductor → ROLE_CONDUCTOR

Token inválido: contexto limpio (request puede fallar luego por authenticated).
