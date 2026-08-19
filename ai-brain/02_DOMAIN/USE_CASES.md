---
id: domain-use-cases
title: Casos de uso
module: 02_DOMAIN
layer: domain
status: active
owner: domain
generated: 2026-07-13
version: "1.0.0"
depends_on: [architecture-modules]
related_modules: [03_BACKEND]
tags: [use-cases]
when_to_update: Nuevo método en ports.in o AuthService
source_paths:
  - backend/src/main/java/com/rycapp/application/ports/in/
  - backend/src/main/java/com/rycapp/application/service/AuthService.java
---

# USE_CASES.md

## Auth (sin port-in formal)

| UC | Método AuthService | API |
|----|--------------------|-----|
| UC-AUTH-REG | registro | POST `/api/auth/registro` |
| UC-AUTH-VERIFY | verificarCorreo | POST `/api/auth/verificar-correo` |
| UC-AUTH-RESEND | reenviarOtp | POST `/api/auth/reenviar-otp` |
| UC-AUTH-RESET-REQ | solicitarRecuperacion | POST `/api/auth/recuperacion/solicitar` |
| UC-AUTH-RESET-CFM | confirmarRecuperacion | POST `/api/auth/recuperacion/confirmar` |
| UC-AUTH-LOGIN | login | POST `/api/auth/login` |
| UC-AUTH-ME | me / summary | GET `/api/auth/me` |

## Ports in

| UC group | Port | Operaciones típicas |
|----------|------|---------------------|
| Usuarios | `UsuarioUseCase` | crear, editar, listar, obtener, conductores, pendientes, activar, catálogos |
| Roles | `RolUseCase` | listar |
| Líneas | `LineaNegocioUseCase` | crear, editar, listar, obtener, cambiarEstado |
| Materiales | `MaterialUseCase` | CRUD |
| Proveedores | `ProveedorUseCase` | CRUD |
| Tipos costo | `TipoCostoUseCase` | CRUD |
| Vehículos | `VehiculoUseCase` | crear, editar, listar, obtener |
| Operaciones | `OperacionUseCase` | crear, obtener, listar, filtrar/historial |
| Nómina | `NominaUseCase` | crear, listar, obtener |
| Costo admin | `CostoAdministrativoUseCase` | crear, listar, obtener |
| Costo vehículo | `CostoVehiculoUseCase` | crear, listar, obtener |
| Costo financiero | `CostoFinancieroOtrosGastosUseCase` | crear, listar, obtener |
| Tickets | `TicketUseCase` | cargar, obtener, listar, PDF, auditoría |
| Siigo | `SiigoConnectionUseCase` | verificarConexion, consultarCuenta |

Índice máquina: `11_METADATA/use-cases.json`.
