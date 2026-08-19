---
id: architecture-modules
title: Mapa de módulos
module: 01_ARCHITECTURE
layer: architecture
status: active
owner: architecture
generated: 2026-07-13
version: "1.0.0"
depends_on: [architecture-overview]
related_modules: [auth, usuarios, operaciones, tickets, siigo, catalogos, costos]
tags: [modules]
when_to_update: Nuevo módulo backend/frontend o eliminación de feature
source_paths:
  - backend/src/main/java/com/rycapp/application/
  - frontend/src/features/
---

# MODULES.md

## Backend (por capacidad)

| Módulo | Port in | Service | Controller | Persistencia |
|--------|---------|---------|------------|--------------|
| Auth | *(ausente)* | `AuthService` | `AuthController` | JPA cuenta/usuario/rol |
| Usuarios | `UsuarioUseCase` | `UsuarioService` | `UsuarioController` | `UsuarioRepository` |
| Roles | `RolUseCase` | `RolService` | `RolController` | `RolRepository` |
| Líneas de negocio | `LineaNegocioUseCase` | `LineaNegocioService` | `LineaNegocioController` | `LineaNegocioRepository` |
| Materiales | `MaterialUseCase` | `MaterialService` | `MaterialController` | `MaterialRepository` |
| Proveedores | `ProveedorUseCase` | `ProveedorService` | `ProveedorController` | `ProveedorRepository` |
| Tipos de costo | `TipoCostoUseCase` | `TipoCostoService` | `TipoCostoController` | `TipoCostoRepository` |
| Vehículos | `VehiculoUseCase` | `VehiculoService` | `VehiculoController` | `VehiculoRepository` |
| Operaciones | `OperacionUseCase` | `OperacionService` | `OperacionController` | `OperacionRepository` |
| Nómina | `NominaUseCase` | `NominaService` | `NominaController` | `NominaRepository` |
| Costo administrativo | `CostoAdministrativoUseCase` | `CostoAdministrativoService` | `CostoAdministrativoController` | `CostoAdministrativoRepository` |
| Costo vehículo | `CostoVehiculoUseCase` | `CostoVehiculoService` | `CostoVehiculoController` | `CostoVehiculoRepository` |
| Costo financiero | `CostoFinancieroOtrosGastosUseCase` | `CostoFinancieroOtrosGastosService` | `CostoFinancieroOtrosGastosController` | `CostoFinancieroOtrosGastosRepository` |
| Tickets | `TicketUseCase` | `TicketService` | `TicketController` | `TicketRepository` + `PdfConversionPort` |
| Siigo | `SiigoConnectionUseCase` | `SiigoConnectionService` | `SiigoController` | `SiigoAuthPort` + `SiigoQueryPort` |

Detalle por módulo: `03_BACKEND/*.md`.

## Frontend (features)

| Feature | Pages | Store | API |
|---------|-------|-------|-----|
| auth | Login, Register, VerifyEmail, ForgotPassword | `useAuthStore` | `authApi` |
| dashboard | DashboardPage | *(local state)* | llamadas HTTP directas |
| lineasNegocio | LineasNegocioPage | `useLineasNegocioStore` | `lineasNegocioApi` |
| usuarios | UsuariosPage | `useUsuariosStore` | `usuariosApi`, `rolesApi` |
| materiales | MaterialesPage | `useMaterialesStore` | `materialesApi` |
| proveedores | ProveedoresPage | `useProveedoresStore` | `proveedoresApi` |
| vehiculos | VehiculosPage | `useVehiculosStore` | `vehiculosApi` |
| operaciones | OperacionesPage, HistorialOperacionesPage | `useOperacionesStore`, `useHistorialOperacionesStore` | `operacionesApi` |
| tickets | TicketsPage | `useTicketsStore` | `ticketsApi` |
| siigo | SiigoConnectionPage | *(local + sessionStorage)* | `siigoApi` |
| clientes / conductores | — | — | scaffolds vacíos |

## Cross-cutting

| Módulo | Ubicación |
|--------|-----------|
| Security | `infrastructure/security` |
| Mail | `infrastructure/mail` |
| Exception handling | `GlobalExceptionHandler` |
| HTTP client / errors | `frontend/src/app/http/` |
| Shell UI | `frontend/src/app/shell/` |
| Design system | `frontend/src/shared/ui/` |
