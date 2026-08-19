---
id: security-authentication
title: Autenticación
module: 07_SECURITY
layer: security
status: active
owner: security
generated: 2026-07-13
version: "1.0.0"
depends_on: [security-index]
related_modules: [auth]
tags: [authentication]
when_to_update: Cambios AuthService / SecurityConfig
source_paths:
  - backend/src/main/java/com/rycapp/infrastructure/security/SecurityConfig.java
  - backend/src/main/java/com/rycapp/application/service/AuthService.java
---

# AUTHENTICATION.md

- Mecanismo: JWT Bearer, sesión STATELESS, CSRF disabled.
- Password: BCrypt strength 12 + PasswordPolicy (≥8, dígito, especial, ≤72).
- OTP: length 6, exp 2 min; hash SHA-256.
- Públicos: registro, verificar-correo, reenviar-otp, recuperacion/*, login, OPTIONS.
- Frontend: token en `localStorage` (`rycapp_token`); interceptor 401 → `/login`.
