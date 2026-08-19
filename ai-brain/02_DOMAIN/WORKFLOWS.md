---
id: domain-workflows
title: Flujos de negocio
module: 02_DOMAIN
layer: domain
status: active
owner: domain
generated: 2026-07-13
version: "1.0.0"
depends_on: [domain-business-rules, domain-use-cases]
related_modules: [auth, tickets, usuarios]
tags: [workflows]
when_to_update: Cambios en secuencias de AuthService, UsuarioService, TicketService
source_paths:
  - backend/src/main/java/com/rycapp/application/service/AuthService.java
  - backend/src/main/java/com/rycapp/application/service/UsuarioService.java
  - backend/src/main/java/com/rycapp/application/service/TicketService.java
---

# WORKFLOWS.md

## WF-01 Registro y activación

```
Registro → OTP correo → Verificar correo → (estado sigue PENDIENTE_APROBACION)
  → Admin lista pendientes → Activar (rol Conductor|Contador) → Mail notificación
  → Login (requiere ACTIVO + verificado)
```

## WF-02 Recuperación de contraseña

```
Solicitar (correo) → OTP reset (si cuenta verificada) → Confirmar con OTP + nuevo password
```

## WF-03 Alta de operación

```
Usuario autenticado → valida FKs catálogo → persiste Operacion (fechaInsercion=now)
```

## WF-04 Carga de ticket

```
ADMIN|CONDUCTOR → multipart (operacionId, archivo[, numeroTicket])
  → validar imagen/tamaño → hash → convertir PDF → guardar Ticket+Contenido
  → auditoría CARGA
```

## WF-05 Consulta/descarga ticket

```
ADMIN|CONTADOR → get metadata (auditoría CONSULTA)
  → get PDF inline (VISUALIZACION) o attachment (DESCARGA)
```

## WF-06 Verificación Siigo

```
ADMIN → /health (token) y/o /consulta (tipos FV + sample users)
```

Diagramas de secuencia: `10_DIAGRAMS/sequence-*.md`.
