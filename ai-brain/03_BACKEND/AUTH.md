---
id: backend-auth
title: Autenticación y cuentas
module: 03_BACKEND
layer: backend
status: active
owner: backend
generated: 2026-07-13
version: "1.0.0"
depends_on: [architecture-modules]
related_entities: []
related_modules: [auth]
tags: [backend, module]
when_to_update: Cambios en AuthService / AuthController / ports
source_paths:
  - backend/src/main/java/com/rycapp/application/service/AuthService.java
  - backend/src/main/java/com/rycapp/interfaces/rest/controller/AuthController.java
---

# Autenticación y cuentas

## Objetivo

Registro, OTP, login JWT, recuperación password, /me.

## Responsabilidades

- Orquestar casos de uso del módulo vía `AuthService`.
- Exponer API REST en `/api/auth` (`AuthController`).
- Aplicar validaciones/reglas documentadas en `02_DOMAIN/BUSINESS_RULES.md`.

## Servicios

| Clase | Rol |
|-------|-----|
| `AuthService` | Application service |

## Casos de uso

Port / contrato: `Sin AuthUseCase; JPA directo`.

## Dependencias

Security, Mail

## Entidades

Usuario, Rol, CuentaAutenticacion

## Eventos

ninguno (sin domain events)

## Riesgos

Bypass hexagonal; secret JWT en config

## Futuras extensiones

Introducir AuthUseCase; MFA: Pendiente de definición funcional

## Evolución

Actualizar este archivo y `06_API`, `11_METADATA` al cambiar endpoints o reglas del módulo.
