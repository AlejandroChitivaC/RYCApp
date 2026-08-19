# -*- coding: utf-8 -*-
"""Generate diagrams, metadata JSON, knowledge graph, generator docs."""
from pathlib import Path
import json

ROOT = Path("ai-brain")
GEN = "2026-07-13"
VER = "1.0.0"

def write(rel, content):
    p = ROOT / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    if isinstance(content, (dict, list)):
        p.write_text(json.dumps(content, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    else:
        p.write_text(content.replace("\r\n", "\n"), encoding="utf-8")
    print("wrote", rel)

# ========== 10_DIAGRAMS ==========
write("10_DIAGRAMS/README.md", f"""---
id: diagrams-index
title: Diagramas (PlantUML/Mermaid)
module: 10_DIAGRAMS
layer: diagrams
status: active
owner: architecture
generated: {GEN}
version: "{VER}"
depends_on: [architecture-overview]
related_modules: []
tags: [diagrams, c4, mermaid, plantuml]
when_to_update: Cambios estructurales del sistema
source_paths: []
---

# Diagramas

Solo representaciones textuales (sin imágenes). Renderizar con Mermaid/PlantUML según necesidad.
""")

write("10_DIAGRAMS/c4-context.md", f"""---
id: diagram-c4-context
title: C4 Context
module: 10_DIAGRAMS
layer: diagrams
status: active
owner: architecture
generated: {GEN}
version: "{VER}"
depends_on: [architecture-overview]
related_modules: []
tags: [c4, mermaid]
---

# C4 — System Context

```mermaid
C4Context
title RYCApp — System Context
Person(admin, "Administrador")
Person(contador, "Contador")
Person(conductor, "Conductor")
Person(registrado, "Usuario registrado")
System(ryc, "RYCApp", "Portal operativo + API")
System_Ext(mysql, "MySQL", "BD rycapp")
System_Ext(siigo, "Siigo API", "ERP cloud")
System_Ext(smtp, "SMTP", "OTP / notificaciones")
Rel(admin, ryc, "HTTPS")
Rel(contador, ryc, "HTTPS")
Rel(conductor, ryc, "HTTPS")
Rel(registrado, ryc, "Registro/OTP")
Rel(ryc, mysql, "JDBC")
Rel(ryc, siigo, "HTTPS RestClient")
Rel(ryc, smtp, "JavaMail")
```

Si el renderer no soporta C4, usar:

```mermaid
flowchart LR
  Users[Usuarios roles] --> SPA[Frontend React]
  SPA --> API[Backend Spring Boot]
  API --> DB[(MySQL rycapp)]
  API --> Siigo[Siigo API]
  API --> Mail[SMTP]
```
""")

write("10_DIAGRAMS/c4-containers.md", f"""---
id: diagram-c4-containers
title: C4 Containers
module: 10_DIAGRAMS
layer: diagrams
status: active
owner: architecture
generated: {GEN}
version: "{VER}"
depends_on: [diagram-c4-context]
related_modules: []
tags: [c4, mermaid]
---

# C4 — Containers

```mermaid
flowchart TB
  Browser[Web Browser]
  SPA[Container: frontend Vite SPA]
  API[Container: rycapp-backend :8080]
  DB[(Container: MySQL)]
  Siigo[Siigo API]
  SMTP[SMTP Provider]
  Browser --> SPA
  SPA -->|REST JSON / multipart| API
  API --> DB
  API --> Siigo
  API --> SMTP
```
""")

write("10_DIAGRAMS/c4-components-backend.md", f"""---
id: diagram-c4-components
title: C4 Components Backend
module: 10_DIAGRAMS
layer: diagrams
status: active
owner: architecture
generated: {GEN}
version: "{VER}"
depends_on: [architecture-overview]
related_modules: []
tags: [c4, components]
---

# C4 — Components (Backend)

```mermaid
flowchart TB
  subgraph interfaces
    CTRL[REST Controllers]
    DTO[DTOs / Mappers]
    EX[GlobalExceptionHandler]
  end
  subgraph application
    UC[Ports In / Services]
    OUT[Ports Out]
  end
  subgraph domain
    MODEL[Domain Records]
  end
  subgraph infrastructure
    JPA[JPA Adapters]
    SEC[JWT / Security]
    MAIL[Mail]
    PDF[PDFBox]
    SIIGO[Siigo Adapters]
  end
  CTRL --> UC
  CTRL --> DTO
  UC --> MODEL
  UC --> OUT
  OUT --> JPA
  OUT --> PDF
  OUT --> SIIGO
  CTRL --> SEC
  UC --> MAIL
```
""")

write("10_DIAGRAMS/components-frontend.md", f"""---
id: diagram-frontend-components
title: Componentes Frontend
module: 10_DIAGRAMS
layer: diagrams
status: active
owner: frontend
generated: {GEN}
version: "{VER}"
depends_on: [frontend-index]
related_modules: []
tags: [frontend, mermaid]
---

# Frontend — componentes

```mermaid
flowchart TB
  Router --> Guards[RequireAuth / RequireRole]
  Guards --> AppLayout
  AppLayout --> Pages
  Pages --> Stores[Zustand Stores]
  Stores --> APIs[feature api.ts]
  APIs --> HTTP[httpClient Axios]
  Pages --> SharedUI[shared/ui]
```
""")

write("10_DIAGRAMS/class-domain.md", f"""---
id: diagram-class-domain
title: Clases de dominio
module: 10_DIAGRAMS
layer: diagrams
status: active
owner: domain
generated: {GEN}
version: "{VER}"
depends_on: [domain-entities]
related_modules: []
tags: [class, plantuml]
---

# Clases — dominio (PlantUML)

```plantuml
@startuml
skinparam classAttributeIconSize 0
class Usuario
class Rol
class Vehiculo
class LineaNegocio
class Material
class Proveedor
class TipoCosto
class Operacion
class Nomina
class CostoAdministrativo
class CostoVehiculo
class CostoFinancieroOtrosGastos
class Ticket
class TicketAuditoria
Rol "1" -- "*" Usuario
Usuario "0..1" -- "0..1" Vehiculo : conductor
Usuario -- Operacion : registra
LineaNegocio -- Operacion
Vehiculo -- Operacion
Material -- Operacion
Proveedor -- Operacion
Operacion "1" -- "*" Ticket
Ticket "1" -- "*" TicketAuditoria
TipoCosto -- Nomina
TipoCosto -- CostoAdministrativo
TipoCosto -- CostoVehiculo
TipoCosto -- CostoFinancieroOtrosGastos
@enduml
```
""")

write("10_DIAGRAMS/sequence-auth.md", f"""---
id: diagram-sequence-auth
title: Secuencia Auth Login
module: 10_DIAGRAMS
layer: diagrams
status: active
owner: backend
generated: {GEN}
version: "{VER}"
depends_on: [domain-workflows]
related_modules: [auth]
tags: [sequence, mermaid]
---

# Secuencia — Login

```mermaid
sequenceDiagram
  participant UI as Frontend
  participant AC as AuthController
  participant AS as AuthService
  participant DB as MySQL
  participant JWT as JwtService
  UI->>AC: POST /api/auth/login
  AC->>AS: login(credentials)
  AS->>DB: cargar cuenta/usuario/rol
  alt inválido / no verificado / pendiente
    AS-->>UI: 401/403 + code
  else OK
    AS->>JWT: generate token
    AS-->>UI: AuthLoginResponse
  end
```
""")

write("10_DIAGRAMS/sequence-ticket.md", f"""---
id: diagram-sequence-ticket
title: Secuencia carga ticket
module: 10_DIAGRAMS
layer: diagrams
status: active
owner: backend
generated: {GEN}
version: "{VER}"
depends_on: [domain-workflows]
related_modules: [tickets]
tags: [sequence, mermaid]
---

# Secuencia — Carga ticket

```mermaid
sequenceDiagram
  participant UI as Frontend
  participant TC as TicketController
  participant TS as TicketService
  participant PDF as PdfConversionPort
  participant TR as TicketRepository
  UI->>TC: POST multipart /api/tickets
  Note over TC: ROLE_ADMIN|CONDUCTOR
  TC->>TS: cargar(...)
  TS->>TS: validar mime/tamaño/hash
  TS->>PDF: imagen a PDF
  TS->>TR: save Ticket + Contenido + Auditoria CARGA
  TS-->>UI: TicketResponse
```
""")

write("10_DIAGRAMS/sequence-siigo.md", f"""---
id: diagram-sequence-siigo
title: Secuencia Siigo consulta
module: 10_DIAGRAMS
layer: diagrams
status: active
owner: backend
generated: {GEN}
version: "{VER}"
depends_on: [integration-siigo]
related_modules: [siigo]
tags: [sequence, mermaid]
---

# Secuencia — Siigo consulta

```mermaid
sequenceDiagram
  participant UI as SiigoConnectionPage
  participant SC as SiigoController
  participant SS as SiigoConnectionService
  participant Auth as SiigoAuthPort
  participant Query as SiigoQueryPort
  participant Ext as api.siigo.com
  UI->>SC: GET /api/siigo/consulta
  Note over SC: ROLE_ADMIN
  SC->>SS: consultarCuenta
  SS->>Auth: obtenerToken
  Auth->>Ext: POST /auth
  SS->>Query: listarTiposFacturaVenta + resumenUsuarios
  Query->>Ext: GET document-types / users
  SS-->>UI: SiigoConsultaResponse
```
""")

write("10_DIAGRAMS/domain-overview.md", f"""---
id: diagram-domain
title: Dominio overview
module: 10_DIAGRAMS
layer: diagrams
status: active
owner: domain
generated: {GEN}
version: "{VER}"
depends_on: [domain-model]
related_modules: []
tags: [domain, mermaid]
---

# Dominio

```mermaid
erDiagram
  ROL ||--o{ USUARIO : has
  USUARIO ||--o| VEHICULO : drives
  USUARIO ||--o{ OPERACION : registers
  LINEA_NEGOCIO ||--o{ OPERACION : classifies
  VEHICULO ||--o{ OPERACION : used_in
  MATERIAL ||--o{ OPERACION : carries
  PROVEEDOR ||--o{ OPERACION : supplies
  OPERACION ||--o{ TICKET : evidenced_by
  TICKET ||--o{ TICKET_AUDITORIA : audited
  TIPO_COSTO ||--o{ NOMINA : typed
  TIPO_COSTO ||--o{ COSTO_ADMIN : typed
  TIPO_COSTO ||--o{ COSTO_VEHICULO : typed
  TIPO_COSTO ||--o{ COSTO_FIN : typed
```
""")

write("10_DIAGRAMS/use-cases.md", f"""---
id: diagram-use-cases
title: Casos de uso UML
module: 10_DIAGRAMS
layer: diagrams
status: active
owner: domain
generated: {GEN}
version: "{VER}"
depends_on: [domain-use-cases]
related_modules: []
tags: [use-cases, plantuml]
---

# Casos de uso (PlantUML)

```plantuml
@startuml
left to right direction
actor Admin
actor Contador
actor Conductor
actor Registrado
rectangle RYCApp {
  Registrado --> (Registrarse)
  Registrado --> (Verificar correo)
  Admin --> (Activar usuario)
  Admin --> (Gestionar catálogos)
  Admin --> (Consultar Siigo)
  Admin --> (Auditar tickets)
  Conductor --> (Cargar ticket)
  Contador --> (Consultar historial)
  Contador --> (Consultar tickets)
  Admin --> (Registrar operación)
  Conductor --> (Registrar operación)
}
@enduml
```
""")

write("10_DIAGRAMS/database-er.md", f"""---
id: diagram-database-er
title: ER Base de datos
module: 10_DIAGRAMS
layer: diagrams
status: active
owner: data
generated: {GEN}
version: "{VER}"
depends_on: [database-physical]
related_modules: []
tags: [database, er, mermaid]
---

# ER (Mermaid)

```mermaid
erDiagram
  Rol ||--o{ Usuario : FK
  Usuario ||--|| Cuenta_Autenticacion : FK
  Usuario ||--o| Vehiculo : ID_Conductor
  Usuario ||--o{ Operaciones_Lineas_Negocio : ID_Usuario_Registro
  Linea_Negocio ||--o{ Operaciones_Lineas_Negocio : FK
  Vehiculo ||--o{ Operaciones_Lineas_Negocio : FK
  Material ||--o{ Operaciones_Lineas_Negocio : FK
  Proveedor ||--o{ Operaciones_Lineas_Negocio : FK
  Operaciones_Lineas_Negocio ||--o{ Ticket : FK
  Ticket ||--|| Ticket_Contenido : FK
  Ticket ||--o{ Ticket_Auditoria : FK
  Tipo_Costo ||--o{ Nomina : FK
  Tipo_Costo ||--o{ Costo_Administrativo : FK
  Tipo_Costo ||--o{ Costo_Vehiculo : FK
  Tipo_Costo ||--o{ Costo_Financiero_OtrosGastos : FK
```
""")

write("10_DIAGRAMS/dependencies.md", f"""---
id: diagram-dependencies
title: Dependencias módulos
module: 10_DIAGRAMS
layer: diagrams
status: active
owner: architecture
generated: {GEN}
version: "{VER}"
depends_on: [architecture-dependencies]
related_modules: []
tags: [dependencies, mermaid]
---

# Dependencias

```mermaid
flowchart LR
  Auth --> Usuarios
  Usuarios --> Roles
  Vehiculos --> Usuarios
  Operaciones --> Usuarios
  Operaciones --> Lineas
  Operaciones --> Vehiculos
  Operaciones --> Materiales
  Operaciones --> Proveedores
  Tickets --> Operaciones
  Tickets --> PDF
  Nominas --> TiposCosto
  Nominas --> Usuarios
  Siigo --> ExtSiigo[Siigo API]
```
""")

# ========== 11_METADATA ==========
entities = [
  {"id": "Usuario", "path": "backend/src/main/java/com/rycapp/domain/model/Usuario.java", "fields": ["id","rolId","cedula","nombre","apellido","estado"]},
  {"id": "Rol", "path": "backend/src/main/java/com/rycapp/domain/model/Rol.java", "fields": ["id","descripcion"]},
  {"id": "Vehiculo", "path": "backend/src/main/java/com/rycapp/domain/model/Vehiculo.java", "fields": ["id","placa","clase","marca","modelo","estado","conductorId"]},
  {"id": "LineaNegocio", "path": "backend/src/main/java/com/rycapp/domain/model/LineaNegocio.java", "fields": ["id","lineaNegocio","descripcion","estado"]},
  {"id": "Material", "path": "backend/src/main/java/com/rycapp/domain/model/Material.java", "fields": ["id","material","descripcion"]},
  {"id": "Proveedor", "path": "backend/src/main/java/com/rycapp/domain/model/Proveedor.java", "fields": ["id","nombre","nit","departamento","municipio","descripcion"]},
  {"id": "TipoCosto", "path": "backend/src/main/java/com/rycapp/domain/model/TipoCosto.java", "fields": ["id","tipoCosto","flujo","descripcion","estado"]},
  {"id": "Operacion", "path": "backend/src/main/java/com/rycapp/domain/model/Operacion.java", "fields": ["id","usuarioRegistroId","lineaNegocioId","vehiculoId","materialId","proveedorId","fechaInsercion","fechaInicio","fechaFin","medioPago","valor","descripcion"]},
  {"id": "Nomina", "path": "backend/src/main/java/com/rycapp/domain/model/Nomina.java", "fields": ["id","usuarioRegistroId","tipoCostoId","usuarioDebitadoId","valor"]},
  {"id": "CostoAdministrativo", "path": "backend/src/main/java/com/rycapp/domain/model/CostoAdministrativo.java", "fields": ["id","usuarioRegistroId","tipoCostoId","valor"]},
  {"id": "CostoVehiculo", "path": "backend/src/main/java/com/rycapp/domain/model/CostoVehiculo.java", "fields": ["id","usuarioRegistroId","tipoCostoId","vehiculoId","motivo","valor"]},
  {"id": "CostoFinancieroOtrosGastos", "path": "backend/src/main/java/com/rycapp/domain/model/CostoFinancieroOtrosGastos.java", "fields": ["id","usuarioRegistroId","tipoCostoId","valor"]},
  {"id": "Ticket", "path": "backend/src/main/java/com/rycapp/domain/model/Ticket.java", "fields": ["id","operacionId","usuarioCargaId","numeroTicket","hashSha256"]},
  {"id": "TicketAuditoria", "path": "backend/src/main/java/com/rycapp/domain/model/TicketAuditoria.java", "fields": ["id","ticketId","usuarioId","accion","fechaAccion"]},
  {"id": "UsuarioPendienteActivacion", "path": "backend/src/main/java/com/rycapp/domain/model/UsuarioPendienteActivacion.java", "fields": ["id","cedula","nombre","apellido","correo"]},
]

modules = [
  {"id": "auth", "backend": "03_BACKEND/AUTH.md", "frontend": "frontend/src/features/auth", "controller": "AuthController"},
  {"id": "usuarios", "backend": "03_BACKEND/USUARIOS.md", "frontend": "frontend/src/features/usuarios", "controller": "UsuarioController"},
  {"id": "roles", "backend": "03_BACKEND/ROLES.md", "frontend": None, "controller": "RolController"},
  {"id": "lineas-negocio", "backend": "03_BACKEND/LINEAS_NEGOCIO.md", "frontend": "frontend/src/features/lineasNegocio", "controller": "LineaNegocioController"},
  {"id": "materiales", "backend": "03_BACKEND/MATERIALES.md", "frontend": "frontend/src/features/materiales", "controller": "MaterialController"},
  {"id": "proveedores", "backend": "03_BACKEND/PROVEEDORES.md", "frontend": "frontend/src/features/proveedores", "controller": "ProveedorController"},
  {"id": "tipos-costo", "backend": "03_BACKEND/TIPOS_COSTO.md", "frontend": None, "controller": "TipoCostoController", "note": "API only; dashboard count only"},
  {"id": "vehiculos", "backend": "03_BACKEND/VEHICULOS.md", "frontend": "frontend/src/features/vehiculos", "controller": "VehiculoController"},
  {"id": "operaciones", "backend": "03_BACKEND/OPERACIONES.md", "frontend": "frontend/src/features/operaciones", "controller": "OperacionController"},
  {"id": "nomina", "backend": "03_BACKEND/NOMINA.md", "frontend": None, "controller": "NominaController", "note": "API only"},
  {"id": "costos-administrativos", "backend": "03_BACKEND/COSTOS_ADMINISTRATIVOS.md", "frontend": None, "controller": "CostoAdministrativoController"},
  {"id": "costos-vehiculo", "backend": "03_BACKEND/COSTOS_VEHICULO.md", "frontend": None, "controller": "CostoVehiculoController"},
  {"id": "costos-financieros", "backend": "03_BACKEND/COSTOS_FINANCIEROS.md", "frontend": None, "controller": "CostoFinancieroOtrosGastosController"},
  {"id": "tickets", "backend": "03_BACKEND/TICKETS.md", "frontend": "frontend/src/features/tickets", "controller": "TicketController"},
  {"id": "siigo", "backend": "03_BACKEND/SIIGO.md", "frontend": "frontend/src/features/siigo", "controller": "SiigoController"},
  {"id": "dashboard", "backend": None, "frontend": "frontend/src/features/dashboard", "controller": None},
]

apis = [
  {"method": "POST", "path": "/api/auth/registro", "auth": "public", "controller": "AuthController"},
  {"method": "POST", "path": "/api/auth/verificar-correo", "auth": "public", "controller": "AuthController"},
  {"method": "POST", "path": "/api/auth/reenviar-otp", "auth": "public", "controller": "AuthController"},
  {"method": "POST", "path": "/api/auth/recuperacion/solicitar", "auth": "public", "controller": "AuthController"},
  {"method": "POST", "path": "/api/auth/recuperacion/confirmar", "auth": "public", "controller": "AuthController"},
  {"method": "POST", "path": "/api/auth/login", "auth": "public", "controller": "AuthController"},
  {"method": "GET", "path": "/api/auth/me", "auth": "jwt", "controller": "AuthController"},
  {"method": "POST", "path": "/api/usuarios", "auth": "jwt", "controller": "UsuarioController"},
  {"method": "PUT", "path": "/api/usuarios/{id}", "auth": "jwt", "controller": "UsuarioController"},
  {"method": "GET", "path": "/api/usuarios", "auth": "jwt", "controller": "UsuarioController"},
  {"method": "GET", "path": "/api/usuarios/{id}", "auth": "jwt", "controller": "UsuarioController"},
  {"method": "GET", "path": "/api/usuarios/conductores", "auth": "jwt", "controller": "UsuarioController"},
  {"method": "GET", "path": "/api/usuarios/catalogo/estados-edicion", "auth": "jwt", "controller": "UsuarioController"},
  {"method": "GET", "path": "/api/usuarios/catalogo/roles-activacion-registro", "auth": "ROLE_ADMIN", "controller": "UsuarioController"},
  {"method": "GET", "path": "/api/usuarios/pendientes-activacion", "auth": "ROLE_ADMIN", "controller": "UsuarioController"},
  {"method": "POST", "path": "/api/usuarios/{id}/activar", "auth": "ROLE_ADMIN", "controller": "UsuarioController"},
  {"method": "GET", "path": "/api/roles", "auth": "jwt", "controller": "RolController"},
  {"method": "POST", "path": "/api/lineas-negocio", "auth": "jwt", "controller": "LineaNegocioController"},
  {"method": "PUT", "path": "/api/lineas-negocio/{id}", "auth": "jwt", "controller": "LineaNegocioController"},
  {"method": "PATCH", "path": "/api/lineas-negocio/{id}/estado", "auth": "jwt", "controller": "LineaNegocioController"},
  {"method": "GET", "path": "/api/lineas-negocio", "auth": "jwt", "controller": "LineaNegocioController"},
  {"method": "GET", "path": "/api/lineas-negocio/{id}", "auth": "jwt", "controller": "LineaNegocioController"},
  {"method": "POST", "path": "/api/materiales", "auth": "jwt", "controller": "MaterialController"},
  {"method": "PUT", "path": "/api/materiales/{id}", "auth": "jwt", "controller": "MaterialController"},
  {"method": "GET", "path": "/api/materiales", "auth": "jwt", "controller": "MaterialController"},
  {"method": "GET", "path": "/api/materiales/{id}", "auth": "jwt", "controller": "MaterialController"},
  {"method": "POST", "path": "/api/proveedores", "auth": "jwt", "controller": "ProveedorController"},
  {"method": "PUT", "path": "/api/proveedores/{id}", "auth": "jwt", "controller": "ProveedorController"},
  {"method": "GET", "path": "/api/proveedores", "auth": "jwt", "controller": "ProveedorController"},
  {"method": "GET", "path": "/api/proveedores/{id}", "auth": "jwt", "controller": "ProveedorController"},
  {"method": "POST", "path": "/api/tipos-costo", "auth": "jwt", "controller": "TipoCostoController"},
  {"method": "PUT", "path": "/api/tipos-costo/{id}", "auth": "jwt", "controller": "TipoCostoController"},
  {"method": "GET", "path": "/api/tipos-costo", "auth": "jwt", "controller": "TipoCostoController"},
  {"method": "GET", "path": "/api/tipos-costo/{id}", "auth": "jwt", "controller": "TipoCostoController"},
  {"method": "POST", "path": "/api/vehiculos", "auth": "jwt", "controller": "VehiculoController"},
  {"method": "PUT", "path": "/api/vehiculos/{id}", "auth": "jwt", "controller": "VehiculoController"},
  {"method": "GET", "path": "/api/vehiculos", "auth": "jwt", "controller": "VehiculoController"},
  {"method": "GET", "path": "/api/vehiculos/{id}", "auth": "jwt", "controller": "VehiculoController"},
  {"method": "POST", "path": "/api/operaciones", "auth": "jwt", "controller": "OperacionController"},
  {"method": "GET", "path": "/api/operaciones", "auth": "jwt", "controller": "OperacionController"},
  {"method": "GET", "path": "/api/operaciones/historial", "auth": "ROLE_ADMIN|ROLE_CONTADOR", "controller": "OperacionController"},
  {"method": "GET", "path": "/api/operaciones/{id}", "auth": "jwt", "controller": "OperacionController"},
  {"method": "POST", "path": "/api/nominas", "auth": "jwt", "controller": "NominaController"},
  {"method": "GET", "path": "/api/nominas", "auth": "jwt", "controller": "NominaController"},
  {"method": "GET", "path": "/api/nominas/{id}", "auth": "jwt", "controller": "NominaController"},
  {"method": "POST", "path": "/api/costos-administrativos", "auth": "jwt", "controller": "CostoAdministrativoController"},
  {"method": "GET", "path": "/api/costos-administrativos", "auth": "jwt", "controller": "CostoAdministrativoController"},
  {"method": "GET", "path": "/api/costos-administrativos/{id}", "auth": "jwt", "controller": "CostoAdministrativoController"},
  {"method": "POST", "path": "/api/costos-vehiculo", "auth": "jwt", "controller": "CostoVehiculoController"},
  {"method": "GET", "path": "/api/costos-vehiculo", "auth": "jwt", "controller": "CostoVehiculoController"},
  {"method": "GET", "path": "/api/costos-vehiculo/{id}", "auth": "jwt", "controller": "CostoVehiculoController"},
  {"method": "POST", "path": "/api/costos-financieros", "auth": "jwt", "controller": "CostoFinancieroOtrosGastosController"},
  {"method": "GET", "path": "/api/costos-financieros", "auth": "jwt", "controller": "CostoFinancieroOtrosGastosController"},
  {"method": "GET", "path": "/api/costos-financieros/{id}", "auth": "jwt", "controller": "CostoFinancieroOtrosGastosController"},
  {"method": "POST", "path": "/api/tickets", "auth": "ROLE_ADMIN|ROLE_CONDUCTOR", "controller": "TicketController"},
  {"method": "GET", "path": "/api/tickets", "auth": "ROLE_ADMIN|ROLE_CONTADOR", "controller": "TicketController"},
  {"method": "GET", "path": "/api/tickets/{id}", "auth": "ROLE_ADMIN|ROLE_CONTADOR", "controller": "TicketController"},
  {"method": "GET", "path": "/api/tickets/{id}/pdf", "auth": "ROLE_ADMIN|ROLE_CONTADOR", "controller": "TicketController"},
  {"method": "GET", "path": "/api/tickets/auditoria", "auth": "ROLE_ADMIN", "controller": "TicketController"},
  {"method": "GET", "path": "/api/tickets/{id}/auditoria", "auth": "ROLE_ADMIN", "controller": "TicketController"},
  {"method": "GET", "path": "/api/siigo/health", "auth": "ROLE_ADMIN", "controller": "SiigoController"},
  {"method": "GET", "path": "/api/siigo/consulta", "auth": "ROLE_ADMIN", "controller": "SiigoController"},
]

business_rules = [
  {"id": "BR-AUTH-01", "doc": "02_DOMAIN/BUSINESS_RULES.md"},
  {"id": "BR-AUTH-02", "doc": "02_DOMAIN/BUSINESS_RULES.md"},
  {"id": "BR-AUTH-03", "doc": "02_DOMAIN/BUSINESS_RULES.md"},
  {"id": "BR-AUTH-04", "doc": "02_DOMAIN/BUSINESS_RULES.md"},
  {"id": "BR-AUTH-05", "doc": "02_DOMAIN/BUSINESS_RULES.md"},
  {"id": "BR-AUTH-06", "doc": "02_DOMAIN/BUSINESS_RULES.md"},
  {"id": "BR-AUTH-07", "doc": "02_DOMAIN/BUSINESS_RULES.md"},
  {"id": "BR-USR-01", "doc": "02_DOMAIN/BUSINESS_RULES.md"},
  {"id": "BR-USR-02", "doc": "02_DOMAIN/BUSINESS_RULES.md"},
  {"id": "BR-USR-03", "doc": "02_DOMAIN/BUSINESS_RULES.md"},
  {"id": "BR-USR-04", "doc": "02_DOMAIN/BUSINESS_RULES.md"},
  {"id": "BR-USR-05", "doc": "02_DOMAIN/BUSINESS_RULES.md"},
  {"id": "BR-VEH-01", "doc": "02_DOMAIN/BUSINESS_RULES.md"},
  {"id": "BR-VEH-02", "doc": "02_DOMAIN/BUSINESS_RULES.md"},
  {"id": "BR-VEH-03", "doc": "02_DOMAIN/BUSINESS_RULES.md"},
  {"id": "BR-VEH-04", "doc": "02_DOMAIN/BUSINESS_RULES.md"},
  {"id": "BR-LN-01", "doc": "02_DOMAIN/BUSINESS_RULES.md"},
  {"id": "BR-PROV-01", "doc": "02_DOMAIN/BUSINESS_RULES.md"},
  {"id": "BR-TC-01", "doc": "02_DOMAIN/BUSINESS_RULES.md"},
  {"id": "BR-OP-01", "doc": "02_DOMAIN/BUSINESS_RULES.md"},
  {"id": "BR-OP-02", "doc": "02_DOMAIN/BUSINESS_RULES.md"},
  {"id": "BR-COST-01", "doc": "02_DOMAIN/BUSINESS_RULES.md"},
  {"id": "BR-TKT-01", "doc": "02_DOMAIN/BUSINESS_RULES.md"},
  {"id": "BR-TKT-02", "doc": "02_DOMAIN/BUSINESS_RULES.md"},
  {"id": "BR-TKT-03", "doc": "02_DOMAIN/BUSINESS_RULES.md"},
  {"id": "BR-TKT-04", "doc": "02_DOMAIN/BUSINESS_RULES.md"},
  {"id": "BR-TKT-05", "doc": "02_DOMAIN/BUSINESS_RULES.md"},
  {"id": "BR-TKT-06", "doc": "02_DOMAIN/BUSINESS_RULES.md"},
  {"id": "BR-TKT-07", "doc": "02_DOMAIN/BUSINESS_RULES.md"},
  {"id": "BR-SIG-01", "doc": "02_DOMAIN/BUSINESS_RULES.md"},
  {"id": "BR-SIG-02", "doc": "02_DOMAIN/BUSINESS_RULES.md"},
  {"id": "BR-GAP-01", "doc": "02_DOMAIN/BUSINESS_RULES.md"},
  {"id": "BR-GAP-02", "doc": "02_DOMAIN/BUSINESS_RULES.md"},
  {"id": "BR-GAP-03", "doc": "02_DOMAIN/BUSINESS_RULES.md"},
]

use_cases = [
  {"id": "UC-AUTH-*", "location": "AuthService / AuthController"},
  {"id": "UsuarioUseCase", "location": "application/ports/in/UsuarioUseCase.java"},
  {"id": "RolUseCase", "location": "application/ports/in/RolUseCase.java"},
  {"id": "LineaNegocioUseCase", "location": "application/ports/in/LineaNegocioUseCase.java"},
  {"id": "MaterialUseCase", "location": "application/ports/in/MaterialUseCase.java"},
  {"id": "ProveedorUseCase", "location": "application/ports/in/ProveedorUseCase.java"},
  {"id": "TipoCostoUseCase", "location": "application/ports/in/TipoCostoUseCase.java"},
  {"id": "VehiculoUseCase", "location": "application/ports/in/VehiculoUseCase.java"},
  {"id": "OperacionUseCase", "location": "application/ports/in/OperacionUseCase.java"},
  {"id": "NominaUseCase", "location": "application/ports/in/NominaUseCase.java"},
  {"id": "CostoAdministrativoUseCase", "location": "application/ports/in/CostoAdministrativoUseCase.java"},
  {"id": "CostoVehiculoUseCase", "location": "application/ports/in/CostoVehiculoUseCase.java"},
  {"id": "CostoFinancieroOtrosGastosUseCase", "location": "application/ports/in/CostoFinancieroOtrosGastosUseCase.java"},
  {"id": "TicketUseCase", "location": "application/ports/in/TicketUseCase.java"},
  {"id": "SiigoConnectionUseCase", "location": "application/ports/in/SiigoConnectionUseCase.java"},
]

relationships = [
  {"from": "Usuario", "to": "Rol", "type": "many-to-one"},
  {"from": "Vehiculo", "to": "Usuario", "type": "optional-one-to-one", "role": "conductor"},
  {"from": "Operacion", "to": "Usuario", "type": "many-to-one", "role": "registrador"},
  {"from": "Operacion", "to": "LineaNegocio", "type": "many-to-one"},
  {"from": "Operacion", "to": "Vehiculo", "type": "many-to-one"},
  {"from": "Operacion", "to": "Material", "type": "many-to-one"},
  {"from": "Operacion", "to": "Proveedor", "type": "many-to-one"},
  {"from": "Ticket", "to": "Operacion", "type": "many-to-one"},
  {"from": "TicketAuditoria", "to": "Ticket", "type": "many-to-one"},
  {"from": "Nomina", "to": "TipoCosto", "type": "many-to-one"},
  {"from": "CostoVehiculo", "to": "Vehiculo", "type": "many-to-one"},
  {"from": "CuentaAutenticacion", "to": "Usuario", "type": "one-to-one", "layer": "infrastructure"},
]

integrations = [
  {"id": "siigo", "doc": "08_INTEGRATIONS/SIIGO.md", "ports": ["SiigoAuthPort", "SiigoQueryPort"], "stage": "verification-only"},
  {"id": "mail", "doc": "08_INTEGRATIONS/MAIL.md", "ports": [], "classes": ["MailOtpSender", "MailAccountNotifications"]},
  {"id": "pdf", "doc": "08_INTEGRATIONS/PDF.md", "ports": ["PdfConversionPort"]},
]

dependencies = {
  "maven_parent": "spring-boot-starter-parent:3.4.2",
  "java": "21",
  "frontend": {"react": "^19.2.4", "vite": "^5.4.19", "zustand": "^5.0.12"},
  "module_edges": relationships,
}

write("11_METADATA/entities.json", {"generated": GEN, "version": VER, "entities": entities})
write("11_METADATA/modules.json", {"generated": GEN, "version": VER, "modules": modules})
write("11_METADATA/apis.json", {"generated": GEN, "version": VER, "endpoints": apis})
write("11_METADATA/business-rules.json", {"generated": GEN, "version": VER, "rules": business_rules})
write("11_METADATA/use-cases.json", {"generated": GEN, "version": VER, "use_cases": use_cases})
write("11_METADATA/relationships.json", {"generated": GEN, "version": VER, "relationships": relationships})
write("11_METADATA/integrations.json", {"generated": GEN, "version": VER, "integrations": integrations})
write("11_METADATA/dependencies.json", {"generated": GEN, "version": VER, "dependencies": dependencies})

# Knowledge graph
nodes = []
edges = []
for e in entities:
    nodes.append({"id": f"entity:{e['id']}", "type": "entity", "label": e["id"], "path": e["path"]})
for m in modules:
    nodes.append({"id": f"module:{m['id']}", "type": "module", "label": m["id"], "backend_doc": m.get("backend"), "frontend": m.get("frontend")})
for a in apis:
    nodes.append({"id": f"api:{a['method']}:{a['path']}", "type": "api", "label": f"{a['method']} {a['path']}", "auth": a["auth"], "controller": a["controller"]})
for br in business_rules:
    nodes.append({"id": f"rule:{br['id']}", "type": "business_rule", "label": br["id"], "doc": br["doc"]})
for integ in integrations:
    nodes.append({"id": f"integration:{integ['id']}", "type": "integration", "label": integ["id"], "doc": integ["doc"]})

for r in relationships:
    edges.append({"from": f"entity:{r['from']}", "to": f"entity:{r['to']}", "type": r["type"], "meta": {k:v for k,v in r.items() if k not in ('from','to','type')}})

# module to entity rough links
mod_ent = {
  "usuarios": ["Usuario"], "roles": ["Rol"], "vehiculos": ["Vehiculo"], "lineas-negocio": ["LineaNegocio"],
  "materiales": ["Material"], "proveedores": ["Proveedor"], "tipos-costo": ["TipoCosto"], "operaciones": ["Operacion"],
  "nomina": ["Nomina"], "costos-administrativos": ["CostoAdministrativo"], "costos-vehiculo": ["CostoVehiculo"],
  "costos-financieros": ["CostoFinancieroOtrosGastos"], "tickets": ["Ticket", "TicketAuditoria"], "auth": ["Usuario", "Rol"],
}
for mid, ents in mod_ent.items():
    for e in ents:
        edges.append({"from": f"module:{mid}", "to": f"entity:{e}", "type": "owns"})

edges.append({"from": "integration:siigo", "to": "module:siigo", "type": "implements"})
edges.append({"from": "integration:pdf", "to": "module:tickets", "type": "supports"})
edges.append({"from": "integration:mail", "to": "module:auth", "type": "supports"})

write("11_METADATA/knowledge-graph.json", {
  "generated": GEN,
  "version": VER,
  "description": "Knowledge graph RYCApp — nodes and edges for LLM indexing",
  "nodes": nodes,
  "edges": edges,
})

# LLM index
llm_index = {
  "generated": GEN,
  "version": VER,
  "project": "PG2_RYCApp / RYCApp / R&C Transportes",
  "entrypoints": {
    "human": "ai-brain/README.md",
    "llm": "ai-brain/11_METADATA/llm-index.json",
    "graph": "ai-brain/11_METADATA/knowledge-graph.json",
  },
  "locate": {
    "modules": "11_METADATA/modules.json",
    "entities": "11_METADATA/entities.json",
    "endpoints": "11_METADATA/apis.json",
    "business_rules": "11_METADATA/business-rules.json",
    "use_cases": "11_METADATA/use-cases.json",
    "integrations": "11_METADATA/integrations.json",
    "relationships": "11_METADATA/relationships.json",
    "dependencies": "11_METADATA/dependencies.json",
  },
  "docs_by_topic": {
    "architecture": "01_ARCHITECTURE/ARCHITECTURE.md",
    "extension": "01_ARCHITECTURE/EXTENSION_GUIDE.md",
    "adrs": "00_PROJECT/DECISIONS.md",
    "domain": "02_DOMAIN/DOMAIN_MODEL.md",
    "security": "07_SECURITY/README.md",
    "siigo": "08_INTEGRATIONS/SIIGO.md",
    "api": "06_API/README.md",
    "database": "05_DATABASE/README.md",
    "frontend": "04_FRONTEND/README.md",
    "testing": "09_TESTING/STRATEGY.md",
    "tech_debt": "01_ARCHITECTURE/ANTI_PATTERNS.md",
  },
  "classes_services": {
    "package_root": "com.rycapp",
    "domain": "backend/src/main/java/com/rycapp/domain/model/",
    "services": "backend/src/main/java/com/rycapp/application/service/",
    "ports_in": "backend/src/main/java/com/rycapp/application/ports/in/",
    "ports_out": "backend/src/main/java/com/rycapp/application/ports/out/",
    "controllers": "backend/src/main/java/com/rycapp/interfaces/rest/controller/",
    "security": "backend/src/main/java/com/rycapp/infrastructure/security/",
    "siigo": "backend/src/main/java/com/rycapp/infrastructure/siigo/",
    "frontend_features": "frontend/src/features/",
  },
  "pending_functional_definition": [
    "Product vision/roadmap oficial",
    "Catálogo cerrado medioPago",
    "Estados LineaNegocio/Vehiculo exhaustivos",
    "Siigo sync/retries/rate-limits",
    "Objetivo de cobertura de tests",
    "Auditoría transversal CRUD",
  ],
}
write("11_METADATA/llm-index.json", llm_index)

# Consistency audit
audit = {
  "generated": GEN,
  "version": VER,
  "summary": "Auditoría cruzada AIKB vs evidencia de código",
  "checks": [
    {"id": "CHK-01", "name": "Controllers vs apis.json", "status": "pass", "notes": "15 controllers mapeados a endpoints documentados"},
    {"id": "CHK-02", "name": "Domain entities vs entities.json", "status": "pass", "notes": "15 tipos domain documentados (incl. UsuarioPendienteActivacion); UsuarioEstados es utility"},
    {"id": "CHK-03", "name": "Frontend features vs modules", "status": "pass_with_gaps", "notes": "clientes/conductores vacíos documentados; costos API sin UI documentado"},
    {"id": "CHK-04", "name": "Auth hexagonal consistency", "status": "documented_inconsistency", "notes": "ADR-005 / ANTI_PATTERNS — Auth sin AuthUseCase"},
    {"id": "CHK-05", "name": "Roles backend vs frontend", "status": "pass", "notes": "Literales Administrador/Contador/Conductor alineados filter y roles.ts"},
    {"id": "CHK-06", "name": "Siigo stage", "status": "pass", "notes": "Docs marcan verification-only; sin sync inventada"},
    {"id": "CHK-07", "name": "Tests", "status": "pass", "notes": "Ausencia de tests documentada consistentemente"},
    {"id": "CHK-08", "name": "Duplicidad vision/roadmap", "status": "mitigated", "notes": "VISION/ROADMAP marcados inferred; PROJECT es fuente primaria de stack"},
    {"id": "CHK-09", "name": "Orphan APIs", "status": "documented", "notes": "nominas/costos/tipos-costo sin feature UI completa"},
    {"id": "CHK-10", "name": "CORS dual config", "status": "documented_debt", "notes": "SecurityConfig + CorsConfig en ANTI_PATTERNS"},
  ],
  "contradictions_found": [],
  "orphans": [
    {"item": "frontend/src/features/clientes", "status": "empty scaffold"},
    {"item": "frontend/src/features/conductores", "status": "empty scaffold"},
    {"item": "backend interfaces/rest/dto/cliente|conductor", "status": "empty dirs"},
    {"item": "cost endpoints UI", "status": "API without pages"},
  ],
  "recommendations": [
    "Tras cada HU: actualizar BUSINESS_RULES, apis.json, modules.json",
    "Resolver o eliminar scaffolds vacíos",
    "Añadir AuthUseCase para alinear hexagonalidad (fuera del alcance AIKB)",
  ],
}
write("11_METADATA/consistency-audit.json", audit)

write("11_METADATA/README.md", f"""---
id: metadata-index
title: Metadata LLM
module: 11_METADATA
layer: metadata
status: active
owner: architecture
generated: {GEN}
version: "{VER}"
depends_on: []
related_modules: []
tags: [metadata, llm, knowledge-graph]
---

# Metadata

Archivos JSON optimizados para indexación LLM. Empezar por `llm-index.json` y `knowledge-graph.json`.

Auditoría: `consistency-audit.json`.
""")

# ========== generator ==========
write("generator/README.md", f"""---
id: generator-readme
title: Generador AIKB
module: generator
layer: tooling
status: active
owner: architecture
generated: {GEN}
version: "{VER}"
depends_on: []
related_modules: []
tags: [generator]
---

# generator/

Scripts auxiliares para regenerar secciones de la AIKB.

| Script | Propósito |
|--------|-----------|
| `_gen_backend.py` | Plantillas módulos 03_BACKEND (histórico de bootstrap) |
| `_gen_rest.py` | Frontend/DB bootstrap |
| `_gen_api_sec.py` | API/Security/Integrations/Testing bootstrap |
| `_gen_meta.py` | Diagramas + metadata JSON (este archivo) |
| `validate_structure.py` | Valida presencia de carpetas/archivos esperados |
| `REGENERATION_CHECKLIST.md` | Checklist humano/agente |

**Nota:** La AIKB es Docs-as-Code. Los scripts `_gen_*` son utilidades de bootstrap; la fuente oficial son los `.md`/`.json` versionados. Tras cambios de código, preferir actualizar docs afectados + re-ejecutar `validate_structure.py`.
""")

write("generator/REGENERATION_CHECKLIST.md", f"""---
id: generator-checklist
title: Checklist de regeneración
module: generator
layer: tooling
status: active
owner: architecture
generated: {GEN}
version: "{VER}"
depends_on: []
related_modules: []
tags: [checklist]
---

# REGENERATION_CHECKLIST.md

Cuando cambie el código, actualizar:

| Cambio en código | Docs AIKB a tocar |
|------------------|-------------------|
| Nuevo Controller/endpoint | `06_API/*`, `apis.json`, diagramas seq si aplica |
| Nueva entidad domain | `02_DOMAIN/*`, `entities.json`, `relationships.json`, ER diagram |
| Nueva regla en Service | `BUSINESS_RULES.md`, `business-rules.json` |
| Nueva migración Flyway | `05_DATABASE/*`, ER diagram |
| Nuevo feature frontend | `04_FRONTEND/*`, `modules.json` |
| Cambio Security/roles | `07_SECURITY/*`, AUTHORIZATION |
| Nueva integración | `08_INTEGRATIONS/*`, `integrations.json` |
| ADR / arquitectura | `DECISIONS.md`, `ARCHITECTURE.md` |

Luego: `python ai-brain/generator/validate_structure.py` y revisar `consistency-audit.json`.
""")

write("generator/validate_structure.py", '''# -*- coding: utf-8 -*-
"""Validate AIKB expected structure exists."""
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
REQUIRED_DIRS = [
    "00_PROJECT", "01_ARCHITECTURE", "02_DOMAIN", "03_BACKEND", "04_FRONTEND",
    "05_DATABASE", "06_API", "07_SECURITY", "08_INTEGRATIONS", "09_TESTING",
    "10_DIAGRAMS", "11_METADATA", "generator",
]
REQUIRED_FILES = [
    "README.md",
    "00_PROJECT/PROJECT.md", "00_PROJECT/VISION.md", "00_PROJECT/ROADMAP.md",
    "00_PROJECT/GLOSSARY.md", "00_PROJECT/DECISIONS.md",
    "01_ARCHITECTURE/ARCHITECTURE.md", "01_ARCHITECTURE/MODULES.md",
    "01_ARCHITECTURE/DEPENDENCIES.md", "01_ARCHITECTURE/PATTERNS.md",
    "01_ARCHITECTURE/ANTI_PATTERNS.md", "01_ARCHITECTURE/CODING_GUIDELINES.md",
    "01_ARCHITECTURE/EXTENSION_GUIDE.md",
    "02_DOMAIN/DOMAIN_MODEL.md", "02_DOMAIN/AGGREGATES.md", "02_DOMAIN/ENTITIES.md",
    "02_DOMAIN/VALUE_OBJECTS.md", "02_DOMAIN/BUSINESS_RULES.md", "02_DOMAIN/WORKFLOWS.md",
    "02_DOMAIN/BOUNDED_CONTEXTS.md", "02_DOMAIN/USE_CASES.md", "02_DOMAIN/STATE_MACHINES.md",
    "08_INTEGRATIONS/SIIGO.md",
    "11_METADATA/llm-index.json", "11_METADATA/knowledge-graph.json",
    "11_METADATA/entities.json", "11_METADATA/modules.json", "11_METADATA/apis.json",
    "11_METADATA/business-rules.json", "11_METADATA/consistency-audit.json",
]

missing = []
for d in REQUIRED_DIRS:
    if not (ROOT / d).is_dir():
        missing.append(f"DIR {d}")
for f in REQUIRED_FILES:
    if not (ROOT / f).is_file():
        missing.append(f"FILE {f}")

if missing:
    print("FAIL — missing:")
    for m in missing:
        print(" -", m)
    sys.exit(1)
print("OK — AIKB structure valid")
print("root:", ROOT)
''')

print("diagrams+metadata done")
print("nodes", len(nodes), "edges", len(edges), "apis", len(apis))
