# -*- coding: utf-8 -*-
"""One-shot generator for remaining AIKB documents. Run from repo root."""
from pathlib import Path
ROOT = Path("ai-brain")
GEN = "2026-07-13"
VER = "1.0.0"

def fm(**kwargs):
    lines = ["---"]
    for k, v in kwargs.items():
        if isinstance(v, list):
            lines.append(f"{k}: [{', '.join(v)}]" if v else f"{k}: []")
        else:
            lines.append(f"{k}: {v}")
    lines.append("---\n")
    return "\n".join(lines)

def write(rel, content):
    p = ROOT / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content, encoding="utf-8")
    print("wrote", p)

# ========== 03_BACKEND ==========
BACKEND_MODULES = [
    ("AUTH.md", "auth", "Autenticación y cuentas", "AuthService", "AuthController", "/api/auth",
     "Registro, OTP, login JWT, recuperación password, /me",
     "Sin AuthUseCase; JPA directo", "Usuario, Rol, CuentaAutenticacion",
     "Security, Mail", "ninguno (sin domain events)", "Bypass hexagonal; secret JWT en config",
     "Introducir AuthUseCase; MFA: Pendiente de definición funcional"),
    ("USUARIOS.md", "usuarios", "Gestión de usuarios y activación", "UsuarioService", "UsuarioController", "/api/usuarios",
     "CRUD, conductores, pendientes, activar, catálogos",
     "UsuarioUseCase", "Usuario, UsuarioPendienteActivacion, Rol",
     "RolRepository, MailAccountNotifications", "ninguno",
     "Activación restringe roles destino", "UI de permisos finos: Pendiente de definición funcional"),
    ("ROLES.md", "roles", "Catálogo de roles", "RolService", "RolController", "/api/roles",
     "Listar roles", "RolUseCase", "Rol", "RolRepository", "ninguno",
     "Roles seeded por migraciones; no CRUD completo", "CRUD roles: Pendiente de definición funcional"),
    ("LINEAS_NEGOCIO.md", "lineas-negocio", "Líneas de negocio", "LineaNegocioService", "LineaNegocioController", "/api/lineas-negocio",
     "CRUD + cambio estado", "LineaNegocioUseCase", "LineaNegocio", "LineaNegocioRepository", "ninguno",
     "Nombre único; ACTIVO al crear", "—"),
    ("MATERIALES.md", "materiales", "Materiales", "MaterialService", "MaterialController", "/api/materiales",
     "CRUD", "MaterialUseCase", "Material", "MaterialRepository", "ninguno", "—", "—"),
    ("PROVEEDORES.md", "proveedores", "Proveedores", "ProveedorService", "ProveedorController", "/api/proveedores",
     "CRUD + unicidad NIT", "ProveedorUseCase", "Proveedor", "ProveedorRepository", "ninguno", "NIT único", "—"),
    ("TIPOS_COSTO.md", "tipos-costo", "Tipos de costo", "TipoCostoService", "TipoCostoController", "/api/tipos-costo",
     "CRUD", "TipoCostoUseCase", "TipoCosto", "TipoCostoRepository", "ninguno",
     "ACTIVO al crear; sin UI dedicada", "Feature UI tipos-costo"),
    ("VEHICULOS.md", "vehiculos", "Flota / vehículos", "VehiculoService", "VehiculoController", "/api/vehiculos",
     "CRUD + validación conductor", "VehiculoUseCase", "Vehiculo, Usuario", "VehiculoRepository, UsuarioRepository", "ninguno",
     "1:1 conductor; estado preservado en edit", "Cambio estado dedicado: Pendiente de definición funcional"),
    ("OPERACIONES.md", "operaciones", "Operaciones de líneas de negocio", "OperacionService", "OperacionController", "/api/operaciones",
     "Crear, listar/filtrar, historial, obtener", "OperacionUseCase", "Operacion", "OperacionRepository + FKs catálogo", "ninguno",
     "Historial solo ADMIN|CONTADOR", "Edición/anulación operación: Pendiente de definición funcional"),
    ("NOMINA.md", "nomina", "Nómina", "NominaService", "NominaController", "/api/nominas",
     "Crear, listar, obtener", "NominaUseCase", "Nomina", "NominaRepository", "ninguno",
     "Sin UI frontend", "Pantallas costos"),
    ("COSTOS_ADMINISTRATIVOS.md", "costos-administrativos", "Costos administrativos", "CostoAdministrativoService", "CostoAdministrativoController", "/api/costos-administrativos",
     "Crear, listar, obtener", "CostoAdministrativoUseCase", "CostoAdministrativo", "CostoAdministrativoRepository", "ninguno",
     "Sin UI frontend", "Pantallas costos"),
    ("COSTOS_VEHICULO.md", "costos-vehiculo", "Costos de vehículo", "CostoVehiculoService", "CostoVehiculoController", "/api/costos-vehiculo",
     "Crear, listar, obtener", "CostoVehiculoUseCase", "CostoVehiculo", "CostoVehiculoRepository", "ninguno",
     "Sin UI frontend", "Pantallas costos"),
    ("COSTOS_FINANCIEROS.md", "costos-financieros", "Costos financieros y otros gastos", "CostoFinancieroOtrosGastosService", "CostoFinancieroOtrosGastosController", "/api/costos-financieros",
     "Crear, listar, obtener", "CostoFinancieroOtrosGastosUseCase", "CostoFinancieroOtrosGastos", "CostoFinancieroOtrosGastosRepository", "ninguno",
     "Sin fechas inicio/fin; sin UI", "Pantallas costos"),
    ("TICKETS.md", "tickets", "Tickets / evidencia documental", "TicketService", "TicketController", "/api/tickets",
     "Carga multipart, listado, PDF, auditoría", "TicketUseCase", "Ticket, TicketAuditoria", "TicketRepository, PdfConversionPort", "auditoría append-only (no domain event bus)",
     "Límites mime/tamaño; RBAC estricto", "OCR/validación contenido: Pendiente de definición funcional"),
    ("SIIGO.md", "siigo", "Conexión Siigo (backend module)", "SiigoConnectionService", "SiigoController", "/api/siigo",
     "Health + consulta cuenta", "SiigoConnectionUseCase", "— (sin entidad dominio)", "SiigoAuthPort, SiigoQueryPort", "ninguno",
     "Solo lectura verificación", "Ver 08_INTEGRATIONS/SIIGO.md"),
]

for fname, mid, title, svc, ctrl, base, resp, uc, ents, deps, evts, risks, future in BACKEND_MODULES:
    body = fm(
        id=f"backend-{mid}",
        title=f'"{title}"',
        module="03_BACKEND",
        layer="backend",
        status="active",
        owner="backend",
        generated=GEN,
        version=VER,
        depends_on="[architecture-modules]",
        related_entities=f"[{ents}]" if ents != "—" else "[]",
        related_modules=f"[{mid}]",
        tags=f"[backend, {mid}]",
        when_to_update=f"Cambios en {svc}, {ctrl} o ports asociados",
        source_paths=f"[backend/src/main/java/com/rycapp/]",
    )
    # Fix related_entities - I used wrong format. Let me rebuild properly.
    content = f"""---
id: backend-{mid}
title: {title}
module: 03_BACKEND
layer: backend
status: active
owner: backend
generated: {GEN}
version: "{VER}"
depends_on: [architecture-modules]
related_entities: []
related_modules: [{mid}]
tags: [backend, module]
when_to_update: Cambios en {svc} / {ctrl} / ports
source_paths:
  - backend/src/main/java/com/rycapp/application/service/{svc}.java
  - backend/src/main/java/com/rycapp/interfaces/rest/controller/{ctrl}.java
---

# {title}

## Objetivo

{resp}.

## Responsabilidades

- Orquestar casos de uso del módulo vía `{svc}`.
- Exponer API REST en `{base}` (`{ctrl}`).
- Aplicar validaciones/reglas documentadas en `02_DOMAIN/BUSINESS_RULES.md`.

## Servicios

| Clase | Rol |
|-------|-----|
| `{svc}` | Application service |

## Casos de uso

Port / contrato: `{uc}`.

## Dependencias

{deps}

## Entidades

{ents}

## Eventos

{evts}

## Riesgos

{risks}

## Futuras extensiones

{future}

## Evolución

Actualizar este archivo y `06_API`, `11_METADATA` al cambiar endpoints o reglas del módulo.
"""
    write(f"03_BACKEND/{fname}", content)

# Overview for backend
write("03_BACKEND/README.md", f"""---
id: backend-index
title: Índice módulos backend
module: 03_BACKEND
layer: backend
status: active
owner: backend
generated: {GEN}
version: "{VER}"
depends_on: [architecture-modules]
related_modules: []
tags: [backend, index]
---

# Backend — módulos

Paquete raíz: `com.rycapp`.

| Archivo | Módulo |
|---------|--------|
""" + "\n".join(f"| [{f}]({f}) | {t} |" for f,_,_,t,*_ in [(x[0],)+x for x in [(m[0], m[2]) for m in BACKEND_MODULES]]) + """

Ver también `01_ARCHITECTURE/MODULES.md`.
""")

# Fix README - I made a mess. Rewrite cleanly.
rows = "\n".join(f"| [{m[0]}]({m[0]}) | {m[2]} |" for m in BACKEND_MODULES)
write("03_BACKEND/README.md", f"""---
id: backend-index
title: Índice módulos backend
module: 03_BACKEND
layer: backend
status: active
owner: backend
generated: {GEN}
version: "{VER}"
depends_on: [architecture-modules]
related_modules: []
tags: [backend, index]
---

# Backend — módulos

Paquete raíz: `com.rycapp`. Entrypoint: `RycAppBackendApplication`.

| Archivo | Módulo |
|---------|--------|
{rows}

Ver también `01_ARCHITECTURE/MODULES.md`.
""")

print("backend done", len(BACKEND_MODULES))
