# -*- coding: utf-8 -*-
"""Generate API, security, integrations, testing, diagrams, metadata, generator."""
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

# ========== 06_API ==========
write("06_API/README.md", f"""---
id: api-index
title: Catálogo API REST
module: 06_API
layer: api
status: active
owner: backend
generated: {GEN}
version: "{VER}"
depends_on: [architecture-modules]
related_modules: []
tags: [api, rest]
when_to_update: Cambios en Controllers o DTOs
source_paths:
  - backend/src/main/java/com/rycapp/interfaces/rest/controller/
---

# API REST

Base: `http://localhost:8080` (local). Prefijo `/api`.

Autenticación: `Authorization: Bearer <JWT>` salvo endpoints públicos auth.

Error estándar: `ApiErrorResponse` — `timestamp, status, error, message, path, fieldErrors, code`.

Documentos por área: AUTH, USUARIOS, CATALOGOS, OPERACIONES, COSTOS, TICKETS, SIIGO, ERRORS.
""")

write("06_API/ERRORS.md", f"""---
id: api-errors
title: Errores API
module: 06_API
layer: api
status: active
owner: backend
generated: {GEN}
version: "{VER}"
depends_on: [api-index]
related_modules: []
tags: [api, errors]
when_to_update: Cambios en GlobalExceptionHandler
source_paths:
  - backend/src/main/java/com/rycapp/interfaces/rest/exception/GlobalExceptionHandler.java
---

# ERRORS.md

| Excepción / caso | HTTP | code |
|------------------|------|------|
| NotFoundException / NoResourceFound | 404 | — |
| ConflictException / DataIntegrity | 409 | — |
| InvalidCredentialsException | 401 | — |
| EmailNotVerifiedException | 403 | EMAIL_NOT_VERIFIED |
| AccountPendingApprovalException | 403 | ACCOUNT_PENDING_APPROVAL |
| InvalidOtpException | 400 | — |
| WeakPasswordException | 400 | WEAK_PASSWORD |
| IllegalArgumentException | 400 | — |
| MethodArgumentNotValidException | 400 | fieldErrors |
| MaxUploadSizeExceeded | 400 | — |
| HttpMediaTypeNotSupported | 415 | — |
| IllegalStateException | 503 | — |
| Security no auth | 401 | — |
| Access denied | 403 | — |
| Genérico | 500 | — |
""")

write("06_API/AUTH.md", f"""---
id: api-auth
title: Endpoints Auth
module: 06_API
layer: api
status: active
owner: backend
generated: {GEN}
version: "{VER}"
depends_on: [api-index, api-errors]
related_modules: [auth]
tags: [api, auth]
when_to_update: Cambios AuthController / DTOs auth
source_paths:
  - backend/src/main/java/com/rycapp/interfaces/rest/controller/AuthController.java
---

# AUTH — `/api/auth`

| Método | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| POST | `/registro` | público | AuthRegisterRequest | MessageResponse |
| POST | `/verificar-correo` | público | AuthVerifyEmailRequest | MessageResponse |
| POST | `/reenviar-otp` | público | AuthResendOtpRequest | MessageResponse |
| POST | `/recuperacion/solicitar` | público | AuthRecuperacionSolicitarRequest | MessageResponse |
| POST | `/recuperacion/confirmar` | público | AuthRecuperacionConfirmarRequest | MessageResponse |
| POST | `/login` | público | AuthLoginRequest | AuthLoginResponse (token + usuario) |
| GET | `/me` | JWT | — | AuthUserSummary |

Campos exactos de DTOs: ver `interfaces/rest/dto/auth/` (fuente de verdad).
""")

write("06_API/USUARIOS.md", f"""---
id: api-usuarios
title: Endpoints Usuarios y Roles
module: 06_API
layer: api
status: active
owner: backend
generated: {GEN}
version: "{VER}"
depends_on: [api-index]
related_modules: [usuarios, roles]
tags: [api]
when_to_update: Cambios UsuarioController / RolController
source_paths:
  - backend/src/main/java/com/rycapp/interfaces/rest/controller/UsuarioController.java
  - backend/src/main/java/com/rycapp/interfaces/rest/controller/RolController.java
---

# USUARIOS — `/api/usuarios`

| Método | Path | Authz | Request | Response |
|--------|------|-------|---------|----------|
| POST | `/` | autenticado | UsuarioCreateRequest | UsuarioResponse |
| PUT | `/{id}` | autenticado | UsuarioUpdateRequest | UsuarioResponse |
| GET | `/` | autenticado | — | List UsuarioResponse |
| GET | `/{id}` | autenticado | — | UsuarioResponse |
| GET | `/conductores` | autenticado | — | lista |
| GET | `/catalogo/estados-edicion` | autenticado | — | List String |
| GET | `/catalogo/roles-activacion-registro` | ROLE_ADMIN | — | List RolResponse |
| GET | `/pendientes-activacion` | ROLE_ADMIN | — | List UsuarioPendienteResponse |
| POST | `/{id}/activar` | ROLE_ADMIN | UsuarioActivarRequest | UsuarioResponse |

# ROLES — `/api/roles`

| Método | Path | Authz | Response |
|--------|------|-------|----------|
| GET | `/` | autenticado | List RolResponse |
""")

write("06_API/CATALOGOS.md", f"""---
id: api-catalogos
title: Endpoints Catálogos
module: 06_API
layer: api
status: active
owner: backend
generated: {GEN}
version: "{VER}"
depends_on: [api-index]
related_modules: [lineas-negocio, materiales, proveedores, vehiculos, tipos-costo]
tags: [api, catalogos]
when_to_update: Cambios en controllers de catálogo
source_paths:
  - backend/src/main/java/com/rycapp/interfaces/rest/controller/
---

# Catálogos

Authz: autenticado (sin `@PreAuthorize` específico) salvo nota.

## `/api/lineas-negocio`

POST `/`, PUT `/{id}`, PATCH `/{id}/estado`, GET `/`, GET `/{id}`

## `/api/materiales`

POST `/`, PUT `/{id}`, GET `/`, GET `/{id}`

## `/api/proveedores`

POST `/`, PUT `/{id}`, GET `/`, GET `/{id}`

## `/api/tipos-costo`

POST `/`, PUT `/{id}`, GET `/`, GET `/{id}`

## `/api/vehiculos`

POST `/`, PUT `/{id}`, GET `/`, GET `/{id}`

DTOs: `interfaces/rest/dto/` por recurso.
""")

write("06_API/OPERACIONES.md", f"""---
id: api-operaciones
title: Endpoints Operaciones
module: 06_API
layer: api
status: active
owner: backend
generated: {GEN}
version: "{VER}"
depends_on: [api-index]
related_modules: [operaciones]
tags: [api]
when_to_update: Cambios OperacionController
source_paths:
  - backend/src/main/java/com/rycapp/interfaces/rest/controller/OperacionController.java
---

# OPERACIONES — `/api/operaciones`

| Método | Path | Authz | Notas |
|--------|------|-------|-------|
| POST | `/` | autenticado | usuarioRegistro desde JWT |
| GET | `/` | autenticado | query: from, to, lineaNegocioId, vehiculoId, proveedorId |
| GET | `/historial` | ROLE_ADMIN \| ROLE_CONTADOR | filtros sin vehiculoId |
| GET | `/{id}` | autenticado | OperacionResponse |

Request create: `OperacionCreateRequest`.
""")

write("06_API/COSTOS.md", f"""---
id: api-costos
title: Endpoints Costos
module: 06_API
layer: api
status: active
owner: backend
generated: {GEN}
version: "{VER}"
depends_on: [api-index]
related_modules: [nomina, costos-administrativos, costos-vehiculo, costos-financieros]
tags: [api, costos]
when_to_update: Cambios controllers de costos
source_paths:
  - backend/src/main/java/com/rycapp/interfaces/rest/controller/
---

# Costos

Authz: autenticado (sin PreAuthorize fino). Patrón: POST `/`, GET `/`, GET `/{id}`.

| Base path | Controller |
|-----------|------------|
| `/api/nominas` | NominaController |
| `/api/costos-administrativos` | CostoAdministrativoController |
| `/api/costos-vehiculo` | CostoVehiculoController |
| `/api/costos-financieros` | CostoFinancieroOtrosGastosController |

**Gap:** sin páginas frontend equivalentes (solo API).
""")

write("06_API/TICKETS.md", f"""---
id: api-tickets
title: Endpoints Tickets
module: 06_API
layer: api
status: active
owner: backend
generated: {GEN}
version: "{VER}"
depends_on: [api-index]
related_modules: [tickets]
tags: [api, tickets]
when_to_update: Cambios TicketController
source_paths:
  - backend/src/main/java/com/rycapp/interfaces/rest/controller/TicketController.java
---

# TICKETS — `/api/tickets`

| Método | Path | Authz | Request/Notes | Response |
|--------|------|-------|---------------|----------|
| POST | `/` | ROLE_ADMIN \| ROLE_CONDUCTOR | multipart: operacionId, numeroTicket?, archivo | TicketResponse |
| GET | `/` | ROLE_ADMIN \| ROLE_CONTADOR | ?operacionId | lista |
| GET | `/{id}` | ROLE_ADMIN \| ROLE_CONTADOR | — | TicketResponse |
| GET | `/{id}/pdf` | ROLE_ADMIN \| ROLE_CONTADOR | ?disposition=attachment\|inline | PDF bytes |
| GET | `/auditoria` | ROLE_ADMIN | — | TicketAuditoriaResponse[] |
| GET | `/{id}/auditoria` | ROLE_ADMIN | — | auditoría |
""")

write("06_API/SIIGO.md", f"""---
id: api-siigo
title: Endpoints Siigo (app)
module: 06_API
layer: api
status: active
owner: backend
generated: {GEN}
version: "{VER}"
depends_on: [api-index, integration-siigo]
related_modules: [siigo]
tags: [api, siigo]
when_to_update: Cambios SiigoController / DTOs
source_paths:
  - backend/src/main/java/com/rycapp/interfaces/rest/controller/SiigoController.java
---

# SIIGO (expuestos por RYCApp) — `/api/siigo`

| Método | Path | Authz | Response |
|--------|------|-------|----------|
| GET | `/health` | ROLE_ADMIN | SiigoHealthResponse |
| GET | `/consulta` | ROLE_ADMIN | SiigoConsultaResponse |

Endpoints externos Siigo: ver `08_INTEGRATIONS/SIIGO.md`.
""")

# ========== 07_SECURITY ==========
write("07_SECURITY/README.md", f"""---
id: security-index
title: Seguridad
module: 07_SECURITY
layer: security
status: active
owner: security
generated: {GEN}
version: "{VER}"
depends_on: [architecture-overview]
related_modules: [auth]
tags: [security, jwt, rbac]
when_to_update: Cambios SecurityConfig / Jwt* / roles
source_paths:
  - backend/src/main/java/com/rycapp/infrastructure/security/
  - frontend/src/features/auth/
---

# Seguridad

Documentos: AUTHENTICATION, AUTHORIZATION, JWT, ROLES_PERMISSIONS, AUDIT.
""")

write("07_SECURITY/AUTHENTICATION.md", f"""---
id: security-authentication
title: Autenticación
module: 07_SECURITY
layer: security
status: active
owner: security
generated: {GEN}
version: "{VER}"
depends_on: [security-index]
related_modules: [auth]
tags: [authentication]
when_to_update: Cambios AuthService / SecurityConfig
source_paths:
  - backend/src/main/java/com/rycapp/infrastructure/security/SecurityConfig.java
  - backend/src/main/java/com/rycapp/application/service/AuthService.java
---

# AUTHENTICATION.md

- Mecanismo: JWT Bearer, sesión STATELESS, CSRF disabled.
- Password: BCrypt strength 12 + PasswordPolicy (≥8, dígito, especial, ≤72).
- OTP: length 6, exp 2 min; hash SHA-256.
- Públicos: registro, verificar-correo, reenviar-otp, recuperacion/*, login, OPTIONS.
- Frontend: token en `localStorage` (`rycapp_token`); interceptor 401 → `/login`.
""")

write("07_SECURITY/AUTHORIZATION.md", f"""---
id: security-authorization
title: Autorización
module: 07_SECURITY
layer: security
status: active
owner: security
generated: {GEN}
version: "{VER}"
depends_on: [security-jwt, security-roles]
related_modules: []
tags: [authorization, rbac]
when_to_update: Cambios @PreAuthorize o roles.ts
source_paths:
  - backend/src/main/java/com/rycapp/interfaces/rest/controller/
  - frontend/src/features/auth/roles.ts
---

# AUTHORIZATION.md

## Capas

1. URL: `/api/**` authenticated (excepto públicos).
2. Method security: `@PreAuthorize` en endpoints sensibles.
3. UI: `RequireRole` + filtro nav.

## Matriz resumida

| Recurso | ADMIN | CONTADOR | CONDUCTOR | USER autenticado |
|---------|-------|----------|-----------|------------------|
| Activación usuarios / catálogo roles activación | ✓ | | | |
| Historial operaciones | ✓ | ✓ | | |
| Tickets carga | ✓ | | ✓ | |
| Tickets lectura/PDF | ✓ | ✓ | | |
| Tickets auditoría | ✓ | | | |
| Siigo | ✓ | | | |
| Catálogos CRUD / costos | *(cualquiera autenticado)* | idem | idem | ✓ |

Gap: catálogos/costos sin PreAuthorize fino.
""")

write("07_SECURITY/JWT.md", f"""---
id: security-jwt
title: JWT
module: 07_SECURITY
layer: security
status: active
owner: security
generated: {GEN}
version: "{VER}"
depends_on: [security-authentication]
related_modules: [auth]
tags: [jwt]
when_to_update: Cambios JwtService / claims
source_paths:
  - backend/src/main/java/com/rycapp/infrastructure/security/JwtService.java
  - backend/src/main/java/com/rycapp/infrastructure/security/JwtAuthenticationFilter.java
  - backend/src/main/resources/application.yml
---

# JWT.md

| Aspecto | Valor |
|---------|-------|
| Algoritmo | HS256 |
| Subject | usuarioId |
| Claims | email, nombre, apellido, rol |
| Expiración | `app.jwt.expiration-minutes` = 720 |
| Secret | `app.jwt.secret` (≥32 chars); default en YAML de desarrollo |

Mapeo rol → authorities en `JwtAuthenticationFilter`:
- siempre ROLE_USER
- Administrador → ROLE_ADMIN
- Contador → ROLE_CONTADOR
- Conductor → ROLE_CONDUCTOR

Token inválido: contexto limpio (request puede fallar luego por authenticated).
""")

write("07_SECURITY/ROLES_PERMISSIONS.md", f"""---
id: security-roles
title: Roles y permisos
module: 07_SECURITY
layer: security
status: active
owner: security
generated: {GEN}
version: "{VER}"
depends_on: [security-authorization]
related_modules: [roles, usuarios]
tags: [roles]
when_to_update: Nuevos roles en migraciones o mapeo JWT
source_paths:
  - backend/src/main/resources/db/migration/
  - frontend/src/features/auth/roles.ts
---

# ROLES_PERMISSIONS.md

## Roles en BD (Descripcion)

| Rol | Origen |
|-----|--------|
| Administrador | V1 |
| Usuario registrado | V2 |
| Conductor | V3 |
| Contador | V4 |

## Permisos explícitos (código)

Ver AUTHORIZATION.md y `roles.ts`:
- ROLES_CONSULTA_HISTORIAL
- ROLES_TICKETS_CARGA / CONSULTA / AUDITORIA
- ROLES_SIIGO

Permisos granulares tipo ACL/scopes: no existen.
""")

write("07_SECURITY/AUDIT.md", f"""---
id: security-audit
title: Auditoría
module: 07_SECURITY
layer: security
status: active
owner: security
generated: {GEN}
version: "{VER}"
depends_on: [domain-entities]
related_modules: [tickets]
tags: [audit]
when_to_update: Nuevas tablas/acciones de auditoría
source_paths:
  - backend/src/main/resources/db/migration/V6__tickets.sql
  - backend/src/main/java/com/rycapp/application/service/TicketService.java
---

# AUDIT.md

## Implementado

- **Ticket_Auditoria**: acciones CARGA, CONSULTA, VISUALIZACION, DESCARGA con usuario y fecha.
- Logs aplicación: Siigo health/consulta (SLF4J).

## No implementado

- Audit trail genérico de CRUD catálogos/operaciones/costos.
- Login audit table.
- SIEM / correlación.

Pendiente de definición funcional para auditoría transversal.
""")

# ========== 08_INTEGRATIONS ==========
write("08_INTEGRATIONS/README.md", f"""---
id: integrations-index
title: Integraciones
module: 08_INTEGRATIONS
layer: integration
status: active
owner: architecture
generated: {GEN}
version: "{VER}"
depends_on: [architecture-overview]
related_modules: [siigo, mail, pdf]
tags: [integrations]
when_to_update: Nueva integración o cambio de vendor
source_paths:
  - backend/src/main/java/com/rycapp/infrastructure/
---

# Integraciones

| Integración | Doc | Tipo |
|-------------|-----|------|
| Siigo | [SIIGO.md](SIIGO.md) | HTTP API externa |
| Mail/SMTP | [MAIL.md](MAIL.md) | JavaMail |
| PDF | [PDF.md](PDF.md) | PDFBox local |
""")

write("08_INTEGRATIONS/SIIGO.md", f"""---
id: integration-siigo
title: Integración Siigo
module: 08_INTEGRATIONS
layer: integration
status: active
owner: backend
generated: {GEN}
version: "{VER}"
depends_on: [backend-siigo, api-siigo]
related_modules: [siigo]
tags: [siigo, integration]
when_to_update: Cambios en infrastructure/siigo o SiigoConnectionService
source_paths:
  - backend/src/main/java/com/rycapp/infrastructure/siigo/
  - backend/src/main/java/com/rycapp/application/service/SiigoConnectionService.java
  - backend/src/main/resources/application.yml
---

# SIIGO.md

## Arquitectura

```
SiigoController → SiigoConnectionUseCase/Service
  → SiigoAuthPort (SiigoAuthAdapter)
  → SiigoQueryPort (SiigoQueryAdapter)
  → RestClient (SiigoConfig) → https://api.siigo.com
```

Config: `app.siigo.*` — base-url, username, access-key, partner-id, timeouts.
Env: `SIIGO_USERNAME`, `SIIGO_ACCESS_KEY`, `SIIGO_PARTNER_ID` (default Partner-Id `RYCApp`).

## Autenticación externa

- POST `/auth` con body `{username, access_key}` y header `Partner-Id`.
- Respuesta token Bearer usado en queries.

## Endpoints externos usados

| Método | Path Siigo | Uso |
|--------|------------|-----|
| POST | `/auth` | Token |
| GET | `/v1/document-types?type=FV` | Tipos factura venta |
| GET | `/v1/users?page=1&page_size=5` | Sample usuarios |

## Endpoints RYCApp

Ver `06_API/SIIGO.md` — solo ADMIN.

## Flujos

1. **Health:** credentialsConfigured? → obtenerToken → HealthResult (no expone token al cliente).
2. **Consulta:** token → document types + users summary → ConsultaResult.

## Sincronización

**No implementada.** Etapa actual: verificación de cuenta (comentario application.yml).

## Errores

- Credenciales ausentes → mensaje en result (`connected=false` / success=false).
- `SiigoAuthException` / `SiigoQueryException` / `IllegalStateException` capturados en service → result fallido (no necesariamente 5xx al cliente si controller mapea result).

## Reintentos

No hay política de retry/backoff en adapters. **Pendiente de definición funcional.**

## Rate limits

No hay manejo explícito de rate limit Siigo. **Pendiente de definición funcional.**

## Responsabilidades

| Componente | Responsabilidad |
|------------|-----------------|
| Properties/Config | URL, credenciales, timeouts, RestClient bean |
| AuthAdapter | obtener token |
| QueryAdapter | lecturas de verificación |
| ConnectionService | orquestación y mensajes |
| Controller | exposición admin + DTO mapping |
| Frontend SiigoConnectionPage | UI health/consulta + activity log |

## Futuras extensiones

Escritura facturas, sync operaciones, webhooks: **Pendiente de definición funcional** + ADR.
""")

write("08_INTEGRATIONS/MAIL.md", f"""---
id: integration-mail
title: Integración correo
module: 08_INTEGRATIONS
layer: integration
status: active
owner: backend
generated: {GEN}
version: "{VER}"
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
""")

write("08_INTEGRATIONS/PDF.md", f"""---
id: integration-pdf
title: Conversión PDF
module: 08_INTEGRATIONS
layer: integration
status: active
owner: backend
generated: {GEN}
version: "{VER}"
depends_on: [backend-tickets]
related_modules: [tickets]
tags: [pdf, pdfbox]
when_to_update: Cambios PdfConversionAdapter
source_paths:
  - backend/src/main/java/com/rycapp/infrastructure/pdf/PdfConversionAdapter.java
  - backend/pom.xml
---

# PDF.md

- Port: `PdfConversionPort`
- Adapter: `PdfConversionAdapter` (Apache PDFBox 3.0.3)
- Uso: tickets — imagen → PDF almacenado en `Ticket_Contenido`
""")

# ========== 09_TESTING ==========
write("09_TESTING/STRATEGY.md", f"""---
id: testing-strategy
title: Estrategia de testing
module: 09_TESTING
layer: quality
status: gap
owner: quality
generated: {GEN}
version: "{VER}"
depends_on: [project-overview]
related_modules: []
tags: [testing]
when_to_update: Cuando existan tests reales
source_paths:
  - backend/pom.xml
  - frontend/package.json
---

# STRATEGY.md

## Estado actual (evidencia)

| Área | Estado |
|------|--------|
| Backend `src/test` | **No encontrado** (starters test en pom) |
| Frontend scripts test / Vitest / Jest | **No encontrado** |
| E2E | **No encontrado** |
| CI test stage | Workflow deploy no ejecuta suite de tests unitarios explícita más allá del build Maven |

## Estrategia recomendada (propuesta documental — no implementada)

**Pendiente de definición funcional** oficial. Sugerencia alineada a arquitectura:

1. Unit: services + PasswordPolicy + mappers.
2. Slice: `@WebMvcTest` controllers + security.
3. Integration: `@SpringBootTest` + Testcontainers MySQL + Flyway.
4. Frontend: Vitest componentes críticos + Playwright smoke auth.

Hasta existir política oficial, marcar cobertura objetivo como pendiente.
""")

write("09_TESTING/COVERAGE.md", f"""---
id: testing-coverage
title: Cobertura
module: 09_TESTING
layer: quality
status: gap
owner: quality
generated: {GEN}
version: "{VER}"
depends_on: [testing-strategy]
related_modules: []
tags: [coverage]
when_to_update: Reportes JaCoCo/Istanbul cuando existan
source_paths: []
---

# COVERAGE.md

Cobertura medida: **no disponible** (sin tests ejecutables en repo).

Objetivo numérico: **Pendiente de definición funcional**.
""")

write("09_TESTING/TYPES.md", f"""---
id: testing-types
title: Tipos de pruebas
module: 09_TESTING
layer: quality
status: gap
owner: quality
generated: {GEN}
version: "{VER}"
depends_on: [testing-strategy]
related_modules: []
tags: [testing]
---

# TYPES.md

| Tipo | Presente |
|------|----------|
| Unit | No |
| Integration | No |
| Contract API | No |
| E2E UI | No |
| Manual / scripts seed | `db/seed/dev_tickets_prueba.sql` (datos, no test) |
""")

write("09_TESTING/BEST_PRACTICES.md", f"""---
id: testing-best-practices
title: Buenas prácticas (para cuando se añadan tests)
module: 09_TESTING
layer: quality
status: guidance
owner: quality
generated: {GEN}
version: "{VER}"
depends_on: [architecture-extension-guide]
related_modules: []
tags: [testing, guidance]
---

# BEST_PRACTICES.md

Derivadas de la arquitectura (aún sin suite):

1. Testear application services contra ports mockeados (hexagonal).
2. No testear solo controllers sin reglas de negocio.
3. Fixtures alineadas a migraciones Flyway.
4. Casos BR-* de BUSINESS_RULES.md como casos de prueba prioritarios.
5. Frontend: mockear `httpClient`; probar RequireRole y flujos auth error codes.
""")

print("06-09 done")
