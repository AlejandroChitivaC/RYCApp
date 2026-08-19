---
id: integration-mail
title: Integración correo
module: 08_INTEGRATIONS
layer: integration
status: active
owner: backend
generated: 2026-07-13
version: "1.0.0"
depends_on: [security-authentication]
related_modules: [auth, usuarios]
tags: [mail, smtp]
when_to_update: Cambios infrastructure/mail o spring.mail
source_paths:
  - backend/src/main/java/com/rycapp/infrastructure/mail/
  - backend/src/main/resources/application-local.example.yml
---

# MAIL.md

| Clase | Uso |
|-------|-----|
| MailOtpSender | Envío OTP (o log si no hay SMTP) |
| MailAccountNotifications | Notificación activación |
| OtpEmailHtmlTemplate | HTML OTP |

- `app.mail.from` default `noreply@rycapp.local`.
- Sin `spring.mail.host` → OTP en logs (comentario application.yml).
- Perfil `local`: ejemplo Brevo en `application-local.example.yml`.

Reintentos/rate limit mail: no implementados.
