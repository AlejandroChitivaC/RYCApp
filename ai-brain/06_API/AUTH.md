---
id: api-auth
title: Endpoints Auth
module: 06_API
layer: api
status: active
owner: backend
generated: 2026-07-13
version: "1.0.0"
depends_on: [api-index, api-errors]
related_modules: [auth]
tags: [api, auth]
when_to_update: Cambios AuthController / DTOs auth
source_paths:
  - backend/src/main/java/com/rycapp/interfaces/rest/controller/AuthController.java
---

# AUTH — `/api/auth`

| Método | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| POST | `/registro` | público | AuthRegisterRequest | MessageResponse |
| POST | `/verificar-correo` | público | AuthVerifyEmailRequest | MessageResponse |
| POST | `/reenviar-otp` | público | AuthResendOtpRequest | MessageResponse |
| POST | `/recuperacion/solicitar` | público | AuthRecuperacionSolicitarRequest | MessageResponse |
| POST | `/recuperacion/confirmar` | público | AuthRecuperacionConfirmarRequest | MessageResponse |
| POST | `/login` | público | AuthLoginRequest | AuthLoginResponse (token + usuario) |
| GET | `/me` | JWT | — | AuthUserSummary |

Campos exactos de DTOs: ver `interfaces/rest/dto/auth/` (fuente de verdad).
