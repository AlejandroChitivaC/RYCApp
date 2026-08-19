---
id: project-overview
title: Resumen del proyecto RYCApp
module: 00_PROJECT
layer: project
status: active
owner: architecture
generated: 2026-07-13
version: "1.0.0"
depends_on: []
related_entities: [Usuario, Operacion, Ticket, Vehiculo, LineaNegocio]
related_modules: [backend, frontend]
tags: [project, overview, stack]
when_to_update: Cambios de stack, alcance, estructura de monorepo o propósito del producto
source_paths:
  - backend/pom.xml
  - frontend/package.json
  - frontend/index.html
  - run-local.ps1
  - .github/workflows/backend-deploy-ec2.yml
---

# PROJECT.md — RYCApp (R&C Transportes)

## Resumen ejecutivo

**RYCApp** es un monorepo con backend Spring Boot y frontend React que soporta la operación de **R&C Transportes**: catálogos (líneas de negocio, materiales, proveedores, vehículos, usuarios), registro de operaciones, costos, tickets (comprobantes) y una integración de solo lectura/verificación con **Siigo**.

Nombre comercial en UI: `R&C Transportes · Portal operativo` (`frontend/index.html`). Constante `APP_NAME = 'R&C Transportes'` en `frontend/src/app/config.ts`.

Artifact backend: `com.rycapp:rycapp-backend:0.0.1-SNAPSHOT`. Descripción Maven: *"Backend módulo 1 - Gestión de Líneas de Negocio"* (histórico; el alcance actual supera ese módulo).

## Objetivo del sistema

Permitir a roles operativos y administrativos:

- Autenticarse y gestionar el ciclo de vida de cuentas (registro, OTP, activación).
- Mantener catálogos maestros.
- Registrar operaciones de líneas de negocio.
- Registrar costos (nómina, administrativos, vehículo, financieros).
- Cargar y consultar tickets asociados a operaciones (imagen → PDF, auditoría).
- Verificar conectividad y datos de cuenta Siigo (admin).

## Problema que resuelve

**Pendiente de definición funcional** (no hay documento de negocio en el repo). Por inferencia del código: digitalizar el registro operativo y de costos de una empresa de transporte, con control de acceso por rol y soporte documental (tickets).

## Alcance

### Incluido (evidencia en código)

| Área | Evidencia |
|------|-----------|
| Auth JWT + OTP + recuperación | `AuthController`, `AuthService` |
| CRUD catálogos | Controllers de línea, material, proveedor, vehículo, tipo costo, usuario, rol |
| Operaciones + historial | `OperacionController` |
| Costos (4 tipos) | Controllers nómina / admin / vehículo / financieros |
| Tickets + auditoría + PDF | `TicketController`, `TicketService`, PDFBox |
| Siigo health + consulta | `SiigoController` |
| SPA React con RBAC UI | `frontend/src/app/router.tsx` |
| Deploy backend EC2 | `.github/workflows/backend-deploy-ec2.yml` |

### Fuera de alcance actual / scaffolds vacíos

| Ítem | Estado |
|------|--------|
| Features `clientes`, `conductores` (frontend) | Carpetas vacías |
| DTOs `cliente`, `conductor` (backend) | Carpetas vacías |
| Escritura/facturación Siigo | No implementado |
| UI dedicada de tipos de costo / costos | Dashboard solo cuenta tipos; sin pages de costos |
| Tests automatizados | Dependencias presentes; sin clases de test |
| Docker | No encontrado |
| README raíz de dominio | No encontrado |

## Stack tecnológico

### Backend

| Tecnología | Versión / detalle |
|------------|-------------------|
| Java | 21 |
| Spring Boot | 3.4.2 |
| Spring Web / Validation / Data JPA / Security / Mail | starters |
| JWT | jjwt 0.12.5 (HS256) |
| Flyway | core + mysql |
| MySQL | connector-j; DB `rycapp` |
| PDFBox | 3.0.3 |
| Lombok | optional |
| Build | Maven |

### Frontend

| Tecnología | Versión / detalle |
|------------|-------------------|
| React | ^19.2.4 |
| Vite | ^5.4.19 |
| TypeScript | ~5.9.3 |
| React Router | ^7.13.1 |
| Zustand | ^5.0.12 |
| Axios | ^1.13.6 |
| Tailwind CSS | ^3.4.17 |
| Notiflix | ^3.2.8 |

### Infra / ops

| Elemento | Detalle |
|----------|---------|
| Local | `run-local.ps1` / `run-local.sh` — MySQL `localhost:3306/rycapp`, backend `:8080`, frontend Vite `:5173` |
| CI backend | GitHub Actions → build JAR → deploy SSH EC2 (paths `backend/**`) |
| Dependabot | npm `/frontend`, maven `/backend` |
| Frontend host | Origen CORS Amplify: `https://master.d35vrictwsl2qg.amplifyapp.com` |

## Estado actual

- Arquitectura hexagonal **ligera** en backend (domain records anémicos + ports + adapters).
- Frontend **feature-sliced** (`app` / `features` / `shared`).
- Integración Siigo en etapa de **auth/health/consulta** (comentario en `application.yml`).
- Sin suite de tests ejecutables en `src/test` ni scripts `test` en frontend.
- Perfil mail `local` documentado vía `application-local.example.yml`.

## Convenciones generales

| Ámbito | Convención |
|--------|------------|
| Idioma UI / rutas | Español |
| API paths | `/api/...` kebab-case |
| Roles (string dominio) | `Administrador`, `Contador`, `Conductor`, `Usuario registrado` |
| Authorities Spring | `ROLE_ADMIN`, `ROLE_CONTADOR`, `ROLE_CONDUCTOR`, `ROLE_USER` |
| Estados usuario | `ACTIVO`, `INACTIVO`, `PENDIENTE_APROBACION` |
| Storage frontend | Prefijos `rycapp_*`, `rycapp.siigo.*`, `ryc_auth_*` |
| Naming DB | PascalCase tablas/columnas; `PhysicalNamingStrategyStandardImpl` |
| Features frontend | camelCase español (`lineasNegocio`) |

## Estructura del monorepo

```
PG2_RYCApp/
├── backend/                 # Spring Boot API
├── frontend/                # React SPA
├── .github/                 # CI + Dependabot
├── run-local.ps1|sh         # Orquestación local
├── ai-brain/                # Esta Knowledge Base
└── .gitignore
```

## Evolución

- **Actualizar cuando:** cambie el propósito, el stack o la estructura raíz.
- **Fuentes:** `pom.xml`, `package.json`, scripts `run-local.*`, workflows.
- **Regenerar:** revisar checklist en `generator/REGENERATION_CHECKLIST.md`.
