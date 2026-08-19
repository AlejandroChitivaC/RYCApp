# -*- coding: utf-8 -*-
from pathlib import Path
import json

ROOT = Path("ai-brain")
GEN = "2026-07-13"
VER = "1.0.0"

def write_json(rel, obj):
    p = ROOT / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("wrote", rel)

def write_text(rel, content):
    p = ROOT / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content, encoding="utf-8")
    print("wrote", rel)

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
  {"id": "tipos-costo", "backend": "03_BACKEND/TIPOS_COSTO.md", "frontend": None, "controller": "TipoCostoController", "note": "API only"},
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

rule_ids = [
  "BR-AUTH-01","BR-AUTH-02","BR-AUTH-03","BR-AUTH-04","BR-AUTH-05","BR-AUTH-06","BR-AUTH-07",
  "BR-USR-01","BR-USR-02","BR-USR-03","BR-USR-04","BR-USR-05",
  "BR-VEH-01","BR-VEH-02","BR-VEH-03","BR-VEH-04",
  "BR-LN-01","BR-PROV-01","BR-TC-01","BR-OP-01","BR-OP-02","BR-COST-01",
  "BR-TKT-01","BR-TKT-02","BR-TKT-03","BR-TKT-04","BR-TKT-05","BR-TKT-06","BR-TKT-07",
  "BR-SIG-01","BR-SIG-02","BR-GAP-01","BR-GAP-02","BR-GAP-03",
]
business_rules = [{"id": r, "doc": "02_DOMAIN/BUSINESS_RULES.md"} for r in rule_ids]

use_cases = [
  {"id": "UC-AUTH-*", "location": "AuthService / AuthController"},
  {"id": "UsuarioUseCase", "location": "backend/src/main/java/com/rycapp/application/ports/in/UsuarioUseCase.java"},
  {"id": "RolUseCase", "location": "backend/src/main/java/com/rycapp/application/ports/in/RolUseCase.java"},
  {"id": "LineaNegocioUseCase", "location": "backend/src/main/java/com/rycapp/application/ports/in/LineaNegocioUseCase.java"},
  {"id": "MaterialUseCase", "location": "backend/src/main/java/com/rycapp/application/ports/in/MaterialUseCase.java"},
  {"id": "ProveedorUseCase", "location": "backend/src/main/java/com/rycapp/application/ports/in/ProveedorUseCase.java"},
  {"id": "TipoCostoUseCase", "location": "backend/src/main/java/com/rycapp/application/ports/in/TipoCostoUseCase.java"},
  {"id": "VehiculoUseCase", "location": "backend/src/main/java/com/rycapp/application/ports/in/VehiculoUseCase.java"},
  {"id": "OperacionUseCase", "location": "backend/src/main/java/com/rycapp/application/ports/in/OperacionUseCase.java"},
  {"id": "NominaUseCase", "location": "backend/src/main/java/com/rycapp/application/ports/in/NominaUseCase.java"},
  {"id": "CostoAdministrativoUseCase", "location": "backend/src/main/java/com/rycapp/application/ports/in/CostoAdministrativoUseCase.java"},
  {"id": "CostoVehiculoUseCase", "location": "backend/src/main/java/com/rycapp/application/ports/in/CostoVehiculoUseCase.java"},
  {"id": "CostoFinancieroOtrosGastosUseCase", "location": "backend/src/main/java/com/rycapp/application/ports/in/CostoFinancieroOtrosGastosUseCase.java"},
  {"id": "TicketUseCase", "location": "backend/src/main/java/com/rycapp/application/ports/in/TicketUseCase.java"},
  {"id": "SiigoConnectionUseCase", "location": "backend/src/main/java/com/rycapp/application/ports/in/SiigoConnectionUseCase.java"},
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
  {"id": "mail", "doc": "08_INTEGRATIONS/MAIL.md", "classes": ["MailOtpSender", "MailAccountNotifications"]},
  {"id": "pdf", "doc": "08_INTEGRATIONS/PDF.md", "ports": ["PdfConversionPort"]},
]

meta = {"generated": GEN, "version": VER}
write_json("11_METADATA/entities.json", {**meta, "entities": entities})
write_json("11_METADATA/modules.json", {**meta, "modules": modules})
write_json("11_METADATA/apis.json", {**meta, "endpoints": apis})
write_json("11_METADATA/business-rules.json", {**meta, "rules": business_rules})
write_json("11_METADATA/use-cases.json", {**meta, "use_cases": use_cases})
write_json("11_METADATA/relationships.json", {**meta, "relationships": relationships})
write_json("11_METADATA/integrations.json", {**meta, "integrations": integrations})
write_json("11_METADATA/dependencies.json", {**meta, "dependencies": {
  "maven_parent": "spring-boot-starter-parent:3.4.2", "java": "21",
  "frontend": {"react": "^19.2.4", "vite": "^5.4.19", "zustand": "^5.0.12"},
  "module_edges": relationships,
}})

nodes, edges = [], []
for e in entities:
    nodes.append({"id": "entity:" + e["id"], "type": "entity", "label": e["id"], "path": e["path"]})
for m in modules:
    nodes.append({"id": "module:" + m["id"], "type": "module", "label": m["id"], "backend_doc": m.get("backend"), "frontend": m.get("frontend")})
for a in apis:
    nodes.append({"id": "api:" + a["method"] + ":" + a["path"], "type": "api", "label": a["method"] + " " + a["path"], "auth": a["auth"], "controller": a["controller"]})
for br in business_rules:
    nodes.append({"id": "rule:" + br["id"], "type": "business_rule", "label": br["id"], "doc": br["doc"]})
for integ in integrations:
    nodes.append({"id": "integration:" + integ["id"], "type": "integration", "label": integ["id"], "doc": integ["doc"]})
for r in relationships:
    edges.append({"from": "entity:" + r["from"], "to": "entity:" + r["to"], "type": r["type"]})
mod_ent = {
  "usuarios": ["Usuario"], "roles": ["Rol"], "vehiculos": ["Vehiculo"], "lineas-negocio": ["LineaNegocio"],
  "materiales": ["Material"], "proveedores": ["Proveedor"], "tipos-costo": ["TipoCosto"], "operaciones": ["Operacion"],
  "nomina": ["Nomina"], "costos-administrativos": ["CostoAdministrativo"], "costos-vehiculo": ["CostoVehiculo"],
  "costos-financieros": ["CostoFinancieroOtrosGastos"], "tickets": ["Ticket", "TicketAuditoria"], "auth": ["Usuario", "Rol"],
}
for mid, ents in mod_ent.items():
    for e in ents:
        edges.append({"from": "module:" + mid, "to": "entity:" + e, "type": "owns"})
edges += [
  {"from": "integration:siigo", "to": "module:siigo", "type": "implements"},
  {"from": "integration:pdf", "to": "module:tickets", "type": "supports"},
  {"from": "integration:mail", "to": "module:auth", "type": "supports"},
]
write_json("11_METADATA/knowledge-graph.json", {**meta, "description": "Knowledge graph RYCApp", "stats": {"nodes": len(nodes), "edges": len(edges)}, "nodes": nodes, "edges": edges})
write_json("11_METADATA/llm-index.json", {**meta, "project": "PG2_RYCApp / RYCApp / R&C Transportes",
  "entrypoints": {"human": "ai-brain/README.md", "llm": "ai-brain/11_METADATA/llm-index.json", "graph": "ai-brain/11_METADATA/knowledge-graph.json"},
  "locate": {"modules": "11_METADATA/modules.json", "entities": "11_METADATA/entities.json", "endpoints": "11_METADATA/apis.json", "business_rules": "11_METADATA/business-rules.json", "use_cases": "11_METADATA/use-cases.json", "integrations": "11_METADATA/integrations.json", "relationships": "11_METADATA/relationships.json", "dependencies": "11_METADATA/dependencies.json"},
  "docs_by_topic": {"architecture": "01_ARCHITECTURE/ARCHITECTURE.md", "extension": "01_ARCHITECTURE/EXTENSION_GUIDE.md", "adrs": "00_PROJECT/DECISIONS.md", "domain": "02_DOMAIN/DOMAIN_MODEL.md", "security": "07_SECURITY/README.md", "siigo": "08_INTEGRATIONS/SIIGO.md", "api": "06_API/README.md", "database": "05_DATABASE/README.md", "frontend": "04_FRONTEND/README.md", "testing": "09_TESTING/STRATEGY.md", "tech_debt": "01_ARCHITECTURE/ANTI_PATTERNS.md"},
  "classes_services": {"package_root": "com.rycapp", "domain": "backend/src/main/java/com/rycapp/domain/model/", "services": "backend/src/main/java/com/rycapp/application/service/", "ports_in": "backend/src/main/java/com/rycapp/application/ports/in/", "ports_out": "backend/src/main/java/com/rycapp/application/ports/out/", "controllers": "backend/src/main/java/com/rycapp/interfaces/rest/controller/", "security": "backend/src/main/java/com/rycapp/infrastructure/security/", "siigo": "backend/src/main/java/com/rycapp/infrastructure/siigo/", "frontend_features": "frontend/src/features/"},
  "pending_functional_definition": ["Product vision/roadmap oficial", "Catalogo cerrado medioPago", "Estados LineaNegocio/Vehiculo exhaustivos", "Siigo sync/retries/rate-limits", "Objetivo de cobertura de tests", "Auditoria transversal CRUD"],
})
write_json("11_METADATA/consistency-audit.json", {**meta, "summary": "Auditoria cruzada AIKB vs evidencia de codigo",
  "checks": [
    {"id": "CHK-01", "name": "Controllers vs apis.json", "status": "pass"},
    {"id": "CHK-02", "name": "Domain entities vs entities.json", "status": "pass"},
    {"id": "CHK-03", "name": "Frontend features vs modules", "status": "pass_with_gaps"},
    {"id": "CHK-04", "name": "Auth hexagonal consistency", "status": "documented_inconsistency"},
    {"id": "CHK-05", "name": "Roles backend vs frontend", "status": "pass"},
    {"id": "CHK-06", "name": "Siigo stage", "status": "pass"},
    {"id": "CHK-07", "name": "Tests absence", "status": "pass"},
    {"id": "CHK-08", "name": "Vision/roadmap inferred", "status": "mitigated"},
    {"id": "CHK-09", "name": "Orphan cost APIs", "status": "documented"},
    {"id": "CHK-10", "name": "CORS dual config", "status": "documented_debt"},
  ],
  "contradictions_found": [],
  "orphans": [
    {"item": "frontend/src/features/clientes", "status": "empty scaffold"},
    {"item": "frontend/src/features/conductores", "status": "empty scaffold"},
    {"item": "cost endpoints UI", "status": "API without pages"},
  ],
})
write_text("11_METADATA/README.md", "---\nid: metadata-index\ntitle: Metadata LLM\nmodule: 11_METADATA\nlayer: metadata\nstatus: active\nowner: architecture\ngenerated: 2026-07-13\nversion: \"1.0.0\"\ndepends_on: []\nrelated_entities: []\nrelated_modules: []\ntags: [metadata, llm]\n---\n\n# Metadata\n\nEmpezar por `llm-index.json` y `knowledge-graph.json`. Auditoria: `consistency-audit.json`.\n")
print("OK nodes", len(nodes), "edges", len(edges), "apis", len(apis))
