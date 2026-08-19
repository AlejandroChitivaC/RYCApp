---
id: project-glossary
title: Glosario del dominio
module: 00_PROJECT
layer: project
status: active
owner: domain
generated: 2026-07-13
version: "1.0.0"
depends_on: [project-overview]
related_entities: [Usuario, Rol, Operacion, Ticket, LineaNegocio, Vehiculo, Material, Proveedor, TipoCosto, Nomina, CostoAdministrativo, CostoVehiculo, CostoFinancieroOtrosGastos]
related_modules: [02_DOMAIN]
tags: [glossary, ubiquitous-language]
when_to_update: Nuevas entidades de dominio o cambios de nombres en UI/API
source_paths:
  - backend/src/main/java/com/rycapp/domain/model/
  - frontend/src/features/
---

# GLOSSARY.md — Lenguaje ubicuo

| Término | Significado en el sistema | Evidencia |
|---------|---------------------------|-----------|
| **Usuario** | Persona del sistema (datos personales + rol + estado). Distinto de cuenta de autenticación. | `Usuario.java` |
| **Cuenta de autenticación** | Credenciales (correo, password hash, OTP). Infraestructura JPA, no modelo de dominio. | `CuentaAutenticacionEntity` |
| **Rol** | Perfil: Administrador, Usuario registrado, Conductor, Contador. | Tabla `Rol`, seeds migraciones |
| **Usuario registrado** | Rol temporal post-registro hasta activación admin. | `V2`, `UsuarioService.activar` |
| **Conductor** | Rol; puede asignarse 1:1 a un vehículo; puede cargar tickets. | `V3`, `TicketController` |
| **Contador** | Rol de consulta (historial, tickets lectura). | `V4`, `@PreAuthorize` |
| **Administrador** | Rol con privilegios de activación, auditoría, Siigo. | Controllers |
| **Línea de negocio** | Catálogo maestro de líneas operativas. | `LineaNegocio` |
| **Material** | Catálogo de materiales transportados/asociados. | `Material` |
| **Proveedor** | Tercero identificado por NIT único. | `Proveedor` |
| **Vehículo** | Unidad de flota (placa única); conductor opcional 1:1. | `Vehiculo` |
| **Operación** | Registro operativo ligado a línea, vehículo, material, proveedor y valor. | `Operacion` / tabla `Operaciones_Lineas_Negocio` |
| **Tipo de costo** | Clasificador de costos (flujo + estado). | `TipoCosto` |
| **Nómina** | Costo con usuario debitado. | `Nomina` |
| **Costo administrativo** | Costo sin vehículo ni debitado. | `CostoAdministrativo` |
| **Costo vehículo** | Costo ligado a vehículo (+ motivo). | `CostoVehiculo` |
| **Costo financiero / otros gastos** | Costo sin fechas inicio/fin. | `CostoFinancieroOtrosGastos` |
| **Ticket** | Evidencia documental de una operación (imagen original → PDF, hash SHA-256). | `Ticket` |
| **Ticket auditoría** | Trazabilidad de acciones CARGA/CONSULTA/VISUALIZACION/DESCARGA. | `TicketAuditoria` |
| **OTP** | Código de un solo uso (verificación correo o reset password). | `AuthService`, `app.auth.otp-*` |
| **Siigo** | ERP/API externa; integración actual de verificación. | `infrastructure/siigo` |
| **JWT** | Token de sesión stateless (claims email, nombre, apellido, rol). | `JwtService` |
| **Historial de operaciones** | Consulta filtrada restringida a Admin/Contador. | `/api/operaciones/historial` |

## Evolución

Añadir términos al introducir entidades o conceptos de UI nuevos; mantener alineación con nombres de dominio Java.
