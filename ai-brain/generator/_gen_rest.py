# -*- coding: utf-8 -*-
"""Generate remaining AIKB sections 04-11 + generator docs."""
from pathlib import Path
import json
ROOT = Path("ai-brain")
GEN = "2026-07-13"
VER = "1.0.0"

def write(rel, content):
    p = ROOT / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content.replace("\r\n", "\n"), encoding="utf-8")
    print("wrote", rel)

# ========== 04_FRONTEND ==========
write("04_FRONTEND/README.md", f"""---
id: frontend-index
title: Frontend overview
module: 04_FRONTEND
layer: frontend
status: active
owner: frontend
generated: {GEN}
version: "{VER}"
depends_on: [project-overview]
related_modules: [frontend]
tags: [frontend, index]
when_to_update: Cambios estructurales en frontend/src
source_paths:
  - frontend/src/
  - frontend/package.json
---

# Frontend — R&C Transportes Portal

SPA React 19 + Vite + TypeScript + Tailwind + Zustand + React Router 7 + Axios.

Estructura: `app/` (shell, router, http) · `features/` · `shared/`.

Documentos:
- [COMPONENTS.md](COMPONENTS.md)
- [LAYOUTS.md](LAYOUTS.md)
- [PAGES.md](PAGES.md)
- [HOOKS.md](HOOKS.md)
- [STORES.md](STORES.md)
- [FLOWS.md](FLOWS.md)
- [DEPENDENCIES.md](DEPENDENCIES.md)
""")

write("04_FRONTEND/COMPONENTS.md", f"""---
id: frontend-components
title: Componentes frontend
module: 04_FRONTEND
layer: frontend
status: active
owner: frontend
generated: {GEN}
version: "{VER}"
depends_on: [frontend-index]
related_modules: []
tags: [components]
when_to_update: Nuevos componentes en shared/ui o features/*/components
source_paths:
  - frontend/src/shared/ui/
  - frontend/src/features/
---

# COMPONENTS.md

## shared/ui (design system)

Button, Input, Textarea, Select, Modal, Table (THead/TBody/TH/TD), PageListToolbar, EmptyState, StatusBadge, StatMiniCard.

## Shell

AppLayout, Sidebar, Topbar, BrandCornerDecor, LayoutSearchProvider, RouteSearchReset.

## Auth

AuthSplitLayout, AuthDarkField, RegistrationStepper, PasswordRecoveryStepper, PasswordFieldWithStrength, RequireAuth, RequireRole.

## Feature forms / UI

LineaNegocioForm, UsuarioForm, MaterialForm, ProveedorForm, VehiculoForm, OperacionForm, TicketForm, TicketDetailModal, SiigoActivityLog.

## Scaffolds vacíos

`features/clientes/components`, `features/conductores/components` — sin archivos.
""")

write("04_FRONTEND/LAYOUTS.md", f"""---
id: frontend-layouts
title: Layouts
module: 04_FRONTEND
layer: frontend
status: active
owner: frontend
generated: {GEN}
version: "{VER}"
depends_on: [frontend-index]
related_modules: []
tags: [layouts]
when_to_update: Cambios en AppLayout o AuthSplitLayout
source_paths:
  - frontend/src/app/shell/AppLayout.tsx
  - frontend/src/features/auth/components/AuthSplitLayout.tsx
---

# LAYOUTS.md

| Layout | Uso |
|--------|-----|
| `AuthSplitLayout` | Páginas públicas auth (login, registro, OTP, recuperación) |
| `AppLayout` | Shell autenticado: Sidebar + Topbar + Outlet |

Brand: Barlow font; tokens Tailwind `brand-*`.
""")

write("04_FRONTEND/PAGES.md", f"""---
id: frontend-pages
title: Pages y rutas
module: 04_FRONTEND
layer: frontend
status: active
owner: frontend
generated: {GEN}
version: "{VER}"
depends_on: [frontend-index]
related_modules: []
tags: [pages, routes]
when_to_update: Cambios en app/router.tsx
source_paths:
  - frontend/src/app/router.tsx
---

# PAGES.md

Fuente: `frontend/src/app/router.tsx`.

## Públicas

| Ruta | Page |
|------|------|
| `/login` | LoginPage |
| `/registro` | RegisterPage |
| `/verificar-correo` | VerifyEmailPage |
| `/recuperar-contrasena` | ForgotPasswordPage |

## Protegidas (RequireAuth + AppLayout)

| Ruta | Page | Guard extra |
|------|------|-------------|
| `/` | redirect `/dashboard` | — |
| `/dashboard` | DashboardPage | — |
| `/lineas-negocio` | LineasNegocioPage | — |
| `/usuarios` | UsuariosPage | — |
| `/materiales` | MaterialesPage | — |
| `/proveedores` | ProveedoresPage | — |
| `/vehiculos` | VehiculosPage | — |
| `/operaciones` | OperacionesPage | — |
| `/historial-operaciones` | HistorialOperacionesPage | Admin, Contador |
| `/tickets` | TicketsPage | Admin, Conductor, Contador |
| `/siigo` | SiigoConnectionPage | Administrador |

Nav espejo: `app/shell/nav.tsx`.
""")

write("04_FRONTEND/HOOKS.md", f"""---
id: frontend-hooks
title: Hooks
module: 04_FRONTEND
layer: frontend
status: active
owner: frontend
generated: {GEN}
version: "{VER}"
depends_on: [frontend-index]
related_modules: []
tags: [hooks]
when_to_update: Nuevos hooks compartidos
source_paths:
  - frontend/src/app/shell/LayoutSearchContext.tsx
---

# HOOKS.md

No existe carpeta `hooks/`.

| Hook / API | Ubicación | Rol |
|------------|-----------|-----|
| `useLayoutSearch` | LayoutSearchContext | Búsqueda global de layout |
| `useNavCounts` | Sidebar (local) | Conteos nav |
| `useAuthStore` etc. | stores Zustand | Ver STORES.md |

Custom hooks reutilizables adicionales: no encontrados.
""")

write("04_FRONTEND/STORES.md", f"""---
id: frontend-stores
title: Stores Zustand
module: 04_FRONTEND
layer: frontend
status: active
owner: frontend
generated: {GEN}
version: "{VER}"
depends_on: [frontend-index]
related_modules: []
tags: [stores, zustand]
when_to_update: Nuevo store.ts en features
source_paths:
  - frontend/src/features/*/store.ts
---

# STORES.md

| Store | Feature |
|-------|---------|
| `useAuthStore` | auth |
| `useUsuariosStore` | usuarios |
| `useMaterialesStore` | materiales |
| `useProveedoresStore` | proveedores |
| `useVehiculosStore` | vehiculos |
| `useLineasNegocioStore` | lineasNegocio |
| `useOperacionesStore` | operaciones |
| `useHistorialOperacionesStore` | operaciones/historialStore |
| `useTicketsStore` | tickets |

Siigo: estado local + `sessionStorage` (`logStorage.ts`). Dashboard: `useState` local.
Patrón: `items`, `isLoading`, `error`, `fetchAll`, `create`, `update`.
""")

write("04_FRONTEND/FLOWS.md", f"""---
id: frontend-flows
title: Flujos de UI
module: 04_FRONTEND
layer: frontend
status: active
owner: frontend
generated: {GEN}
version: "{VER}"
depends_on: [domain-workflows, frontend-pages]
related_modules: []
tags: [flows, ux]
when_to_update: Cambios de journey en pages auth/tickets/usuarios
source_paths:
  - frontend/src/features/
---

# FLOWS.md

1. **Auth:** login / registro / OTP / recuperación (steppers).
2. **Dashboard:** cards de conteos (incluye `/api/tipos-costo` sin feature propia).
3. **CRUD catálogos:** lista + toolbar + modal form (líneas, usuarios, materiales, proveedores, vehículos).
4. **Activación usuarios (admin):** pendientes → asignar rol Conductor/Contador.
5. **Operaciones:** alta con dependencias de catálogo + filtros.
6. **Historial:** Admin/Contador read-only.
7. **Tickets:** carga (Admin/Conductor), consulta/PDF (Admin/Contador), auditoría (Admin).
8. **Siigo:** health + consulta + activity log sessionStorage.

Alineados con `02_DOMAIN/WORKFLOWS.md`.
""")

write("04_FRONTEND/DEPENDENCIES.md", f"""---
id: frontend-dependencies
title: Dependencias frontend
module: 04_FRONTEND
layer: frontend
status: active
owner: frontend
generated: {GEN}
version: "{VER}"
depends_on: [architecture-dependencies]
related_modules: []
tags: [dependencies]
when_to_update: Cambios en package.json o api.ts
source_paths:
  - frontend/package.json
  - frontend/src/app/http/httpClient.ts
  - frontend/.env.example
---

# DEPENDENCIES.md (frontend)

## npm

Ver `01_ARCHITECTURE/DEPENDENCIES.md` sección frontend.

## Runtime config

| Variable | Uso |
|----------|-----|
| `VITE_API_BASE_URL` | Base API (default `http://localhost:8080`) |

Documentada en `frontend/.env.example`.

## Cliente HTTP

`httpClient.ts`: Bearer `rycapp_token`, header ngrok-skip, limpia Content-Type en FormData, 401 → logout redirect `/login`.

## Dependencias feature → API

Cada `features/*/api.ts` → endpoints en `06_API/`.
""")

# ========== 05_DATABASE ==========
write("05_DATABASE/README.md", f"""---
id: database-index
title: Base de datos
module: 05_DATABASE
layer: data
status: active
owner: data
generated: {GEN}
version: "{VER}"
depends_on: [architecture-overview]
related_modules: []
tags: [database, flyway, mysql]
when_to_update: Nueva migración Flyway
source_paths:
  - backend/src/main/resources/db/migration/
  - backend/src/main/resources/application.yml
---

# Database

- Motor: MySQL 8 (`rycapp`)
- Migraciones: Flyway `classpath:db/migration`
- JPA: `ddl-auto: validate`
- Naming: `PhysicalNamingStrategyStandardImpl` (nombres físicos literales)

Documentos: LOGICAL_MODEL, PHYSICAL_MODEL, RELATIONSHIPS, INDEXES, CONSTRAINTS, DATA_DICTIONARY.
""")

write("05_DATABASE/LOGICAL_MODEL.md", f"""---
id: database-logical
title: Modelo lógico
module: 05_DATABASE
layer: data
status: active
owner: data
generated: {GEN}
version: "{VER}"
depends_on: [domain-model]
related_entities: []
related_modules: []
tags: [database, logical]
when_to_update: Cambios ER en migraciones
source_paths:
  - backend/src/main/resources/db/migration/
---

# LOGICAL_MODEL.md

Entidades lógicas alineadas al dominio + cuenta y contenido de ticket:

Rol, Usuario, Cuenta_Autenticacion, Vehiculo, Linea_Negocio, Material, Proveedor, Tipo_Costo,
Operaciones_Lineas_Negocio, Nomina, Costo_Administrativo, Costo_Vehiculo, Costo_Financiero_OtrosGastos,
Ticket, Ticket_Contenido, Ticket_Auditoria.

Ver diagramas ER en `10_DIAGRAMS/database-er.md`.
""")

write("05_DATABASE/PHYSICAL_MODEL.md", f"""---
id: database-physical
title: Modelo físico
module: 05_DATABASE
layer: data
status: active
owner: data
generated: {GEN}
version: "{VER}"
depends_on: [database-logical]
related_modules: []
tags: [database, physical, flyway]
when_to_update: Nueva migración
source_paths:
  - backend/src/main/resources/db/migration/
---

# PHYSICAL_MODEL.md

## Migraciones

| Archivo | Contenido |
|---------|-----------|
| V1__init.sql | Núcleo ER + seeds Rol Administrador, Usuario sistema, Material/Proveedor inicial |
| V2__auth_cuenta_otp.sql | Rol «Usuario registrado»; Cuenta_Autenticacion |
| V3__vehiculo_conductor_flujo_cuentas.sql | Rol Conductor; Vehiculo.ID_Conductor |
| V4__rol_contador.sql | Rol Contador |
| V5__cuenta_reset_otp.sql | Reset_OTP_Hash, Reset_OTP_Expira |
| V6__tickets.sql | Ticket, Ticket_Contenido, Ticket_Auditoria |

Seed opcional no Flyway: `db/seed/dev_tickets_prueba.sql`.

## Engine / charset

InnoDB, utf8mb4_0900_ai_ci (V1).
""")

write("05_DATABASE/RELATIONSHIPS.md", f"""---
id: database-relationships
title: Relaciones FK
module: 05_DATABASE
layer: data
status: active
owner: data
generated: {GEN}
version: "{VER}"
depends_on: [database-physical]
related_modules: []
tags: [database, fk]
when_to_update: Nuevas FK en migraciones
source_paths:
  - backend/src/main/resources/db/migration/
---

# RELATIONSHIPS.md

| Hijo | FK | Padre |
|------|----|-------|
| Usuario.ID_Rol | fk_usuario_rol | Rol |
| Cuenta_Autenticacion → Usuario | 1:1 | Usuario |
| Vehiculo.ID_Conductor | UK+FK | Usuario |
| Operaciones_Lineas_Negocio | usuario, linea, vehiculo, material, proveedor | respectivos |
| Nomina | reg, tipo, debitado | Usuario, Tipo_Costo, Usuario |
| Costo_Administrativo | usuario, tipo | Usuario, Tipo_Costo |
| Costo_Vehiculo | usuario, tipo, vehiculo | Usuario, Tipo_Costo, Vehiculo |
| Costo_Financiero_OtrosGastos | usuario, tipo | Usuario, Tipo_Costo |
| Ticket | operacion, usuario carga | Operaciones_Lineas_Negocio, Usuario |
| Ticket_Contenido | PK=FK ticket | Ticket |
| Ticket_Auditoria | ticket, usuario | Ticket, Usuario |
""")

write("05_DATABASE/INDEXES.md", f"""---
id: database-indexes
title: Índices
module: 05_DATABASE
layer: data
status: active
owner: data
generated: {GEN}
version: "{VER}"
depends_on: [database-physical]
related_modules: []
tags: [database, indexes]
when_to_update: Nuevos KEY/UNIQUE en SQL
source_paths:
  - backend/src/main/resources/db/migration/
---

# INDEXES.md

| Tabla | Índice | Tipo |
|-------|--------|------|
| Usuario | uk_usuario_cedula | UNIQUE |
| Usuario | ix_usuario_rol | KEY |
| Vehiculo | uk_vehiculo_placa | UNIQUE |
| Vehiculo | ID_Conductor | UNIQUE (V3) |
| Linea_Negocio | uk_linea_negocio_nombre | UNIQUE |
| Proveedor | uk_proveedor_nit | UNIQUE |
| Operaciones_Lineas_Negocio | ix_op_linea, ix_op_fecha_ins | KEY |
| Cuenta_Autenticacion | UK usuario, UK correo | UNIQUE |
| Ticket | UK hash, UK número (si aplica), ix operacion/fecha | UNIQUE/KEY |
| Ticket_Auditoria | ix ticket, fecha | KEY |

Lista exhaustiva de nombres en V6: consultar `V6__tickets.sql` al regenerar.
""")

write("05_DATABASE/CONSTRAINTS.md", f"""---
id: database-constraints
title: Restricciones
module: 05_DATABASE
layer: data
status: active
owner: data
generated: {GEN}
version: "{VER}"
depends_on: [database-relationships]
related_modules: []
tags: [database, constraints]
when_to_update: Cambios NOT NULL/UNIQUE/FK
source_paths:
  - backend/src/main/resources/db/migration/
---

# CONSTRAINTS.md

- PKs AUTO_INCREMENT BIGINT en tablas principales.
- NOT NULL en campos de negocio críticos (cédula, placa, valor, medio_pago, etc.).
- UNIQUE: cédula, placa, NIT, nombre línea, hash ticket, correo cuenta.
- FK RESTRICT default InnoDB (sin ON DELETE CASCADE explícito en V1).
- DECIMAL(14,2) para valores monetarios.
- DATETIME(3) para timestamps.
- Soft-delete: no existe.
""")

write("05_DATABASE/DATA_DICTIONARY.md", f"""---
id: database-dictionary
title: Diccionario de datos (resumen)
module: 05_DATABASE
layer: data
status: active
owner: data
generated: {GEN}
version: "{VER}"
depends_on: [database-physical, domain-entities]
related_modules: []
tags: [database, dictionary]
when_to_update: Cambios de columnas
source_paths:
  - backend/src/main/resources/db/migration/V1__init.sql
  - backend/src/main/resources/db/migration/V6__tickets.sql
---

# DATA_DICTIONARY.md

Resumen de tablas principales (detalle exacto en migraciones SQL — fuente de verdad).

| Tabla | Columnas clave |
|-------|----------------|
| Rol | ID_Rol, Descripcion |
| Usuario | ID_Usuario, ID_Rol, Cedula, Nombre, Apellido, Estado |
| Cuenta_Autenticacion | vínculo Usuario, Correo, Password_Hash, flags OTP/verificación/reset |
| Vehiculo | ID_Vehiculo, Placa, Clase, Marca, Modelo, Estado, ID_Conductor |
| Linea_Negocio | ID_Linea_Negocio, Linea_Negocio, Descripcion, Estado |
| Material | ID_Material, Material, Descripcion |
| Proveedor | ID_Proveedor, Nombre, NIT, Departamento, Municipio, Descripcion |
| Tipo_Costo | ID_Tipo_Costo, Tipo_costo, Flujo, Descripcion, Estado |
| Operaciones_Lineas_Negocio | FKs + fechas + Medio_Pago + Valor + Descripcion |
| Nomina / Costos* | FKs + Valor + Medio_Pago (+ Motivo en vehículo) |
| Ticket | FKs + Numero + Hash + metadata archivo + Fecha_Carga |
| Ticket_Contenido | contenido binario PDF |
| Ticket_Auditoria | accion + usuario + fecha |

Para regeneración automática completa de columnas, parsear `V*.sql` (ver generator).
""")

print("04-05 done")
