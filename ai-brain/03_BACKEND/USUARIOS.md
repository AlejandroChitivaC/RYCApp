---
id: backend-usuarios
title: Gestión de usuarios y activación
module: 03_BACKEND
layer: backend
status: active
owner: backend
generated: 2026-07-13
version: "1.0.0"
depends_on: [architecture-modules]
related_entities: []
related_modules: [usuarios]
tags: [backend, module]
when_to_update: Cambios en UsuarioService / UsuarioController / ports
source_paths:
  - backend/src/main/java/com/rycapp/application/service/UsuarioService.java
  - backend/src/main/java/com/rycapp/interfaces/rest/controller/UsuarioController.java
---

# Gestión de usuarios y activación

## Objetivo

CRUD, conductores, pendientes, activar, catálogos.

## Responsabilidades

- Orquestar casos de uso del módulo vía `UsuarioService`.
- Exponer API REST en `/api/usuarios` (`UsuarioController`).
- Aplicar validaciones/reglas documentadas en `02_DOMAIN/BUSINESS_RULES.md`.

## Servicios

| Clase | Rol |
|-------|-----|
| `UsuarioService` | Application service |

## Casos de uso

Port / contrato: `UsuarioUseCase`.

## Dependencias

RolRepository, MailAccountNotifications

## Entidades

Usuario, UsuarioPendienteActivacion, Rol

## Eventos

ninguno

## Riesgos

Activación restringe roles destino

## Futuras extensiones

UI de permisos finos: Pendiente de definición funcional

## Evolución

Actualizar este archivo y `06_API`, `11_METADATA` al cambiar endpoints o reglas del módulo.
