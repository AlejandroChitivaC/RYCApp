---
id: domain-business-rules
title: Reglas de negocio
module: 02_DOMAIN
layer: domain
status: active
owner: domain
generated: 2026-07-13
version: "1.0.0"
depends_on: [domain-entities]
related_entities: [Usuario, Vehiculo, Ticket, Operacion, Proveedor]
related_modules: [auth, tickets, usuarios]
tags: [business-rules]
when_to_update: Cualquier cambio en application.service que altere validaciones
source_paths:
  - backend/src/main/java/com/rycapp/application/service/
---

# BUSINESS_RULES.md

Cada regla incluye ID estable para indexación LLM.

## Auth / identidad

| ID | Regla | Evidencia |
|----|-------|-----------|
| BR-AUTH-01 | Registro crea usuario con rol «Usuario registrado» y estado `PENDIENTE_APROBACION` | `AuthService` |
| BR-AUTH-02 | Correo inicia no verificado; requiere OTP | `AuthService` |
| BR-AUTH-03 | Login exige password válido + correo verificado + estado `ACTIVO` | `AuthService` |
| BR-AUTH-04 | Password cumple `PasswordPolicy` | `PasswordPolicy` |
| BR-AUTH-05 | Recuperación no revela si el correo existe | `AuthService` |
| BR-AUTH-06 | OTP reset solo si correo verificado | `AuthService` |
| BR-AUTH-07 | OTP length 6, expiración 2 minutos (config) | `application.yml` |

## Usuarios

| ID | Regla | Evidencia |
|----|-------|-----------|
| BR-USR-01 | Alta por admin → estado `ACTIVO` | `UsuarioService` |
| BR-USR-02 | Edición solo estados de `UsuarioEstados` | `UsuarioEstados` |
| BR-USR-03 | Activación solo si pendiente y rol «Usuario registrado» | `UsuarioService` |
| BR-USR-04 | Rol post-activación solo Conductor o Contador | `UsuarioService` |
| BR-USR-05 | Activación notifica por correo | `MailAccountNotifications` |

## Vehículos

| ID | Regla | Evidencia |
|----|-------|-----------|
| BR-VEH-01 | Placa única | servicio + UK |
| BR-VEH-02 | Conductor opcional; si existe debe ser rol Conductor | `VehiculoService` |
| BR-VEH-03 | Un conductor solo en un vehículo (1:1) | UK `ID_Conductor` + servicio |
| BR-VEH-04 | Edición preserva estado (no lo cambia el update) | `VehiculoService` |

## Catálogos

| ID | Regla | Evidencia |
|----|-------|-----------|
| BR-LN-01 | Crear línea → estado `ACTIVO`; nombre único | `LineaNegocioService` |
| BR-PROV-01 | NIT único (case-insensitive donde aplica) | `ProveedorService` |
| BR-TC-01 | Crear tipo costo → `ACTIVO` | `TipoCostoService` |

## Operaciones y costos

| ID | Regla | Evidencia |
|----|-------|-----------|
| BR-OP-01 | Todas las FKs deben existir antes de crear | `OperacionService` |
| BR-OP-02 | `fechaInsercion` = ahora al crear | servicios |
| BR-COST-01 | Costos/nómina validan FKs referenciadas | `*Service` |

## Tickets

| ID | Regla | Evidencia |
|----|-------|-----------|
| BR-TKT-01 | Solo imágenes JPEG/PNG/GIF/BMP | `TicketService` |
| BR-TKT-02 | Tamaño máx. 10MB | multipart + servicio |
| BR-TKT-03 | Hash SHA-256 único (dedup) | UK + servicio |
| BR-TKT-04 | Número de ticket opcional pero único | servicio |
| BR-TKT-05 | Conversión a PDF obligatoria al cargar | `PdfConversionPort` |
| BR-TKT-06 | Auditoría en CARGA, CONSULTA, VISUALIZACION, DESCARGA | `TicketService` |
| BR-TKT-07 | Carga: ADMIN o CONDUCTOR; lectura: ADMIN o CONTADOR; auditoría: ADMIN | `@PreAuthorize` |

## Siigo

| ID | Regla | Evidencia |
|----|-------|-----------|
| BR-SIG-01 | Solo ADMIN | `@PreAuthorize` |
| BR-SIG-02 | Health no lanza HTTP error por fallo de conexión; retorna `connected=false` | `SiigoConnectionService` / controller |

## Reglas implícitas / gaps

| ID | Observación |
|----|-------------|
| BR-GAP-01 | Catálogos/costos mutables por cualquier autenticado (sin PreAuthorize fino) |
| BR-GAP-02 | Catálogo cerrado de `medioPago`: **Pendiente de definición funcional** |
| BR-GAP-03 | Soft-delete: no existe |
