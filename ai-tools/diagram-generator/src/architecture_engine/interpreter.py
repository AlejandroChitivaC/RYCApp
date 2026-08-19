"""Interpret ProjectKnowledge + AIKB Markdown into ArchitectureModel."""

from __future__ import annotations

import logging
import re
from typing import Any

from architecture_engine.classifier import LayerClassifier
from architecture_engine.markdown_enricher import (
    extract_section,
    first_matching_table,
    strip_md,
)
from architecture_engine.models import (
    ArchElement,
    ArchLayer,
    ArchLevel,
    ArchRelationship,
    ArchitectureModel,
    BoundedContext,
    ElementKind,
)
from models.project import ProjectKnowledge

logger = logging.getLogger(__name__)

# Module id → bounded context (evidence: 02_DOMAIN/BOUNDED_CONTEXTS.md)
MODULE_CONTEXT_MAP: dict[str, str] = {
    "auth": "identity-access",
    "usuarios": "identity-access",
    "roles": "identity-access",
    "vehiculos": "fleet-catalog",
    "lineas-negocio": "fleet-catalog",
    "materiales": "fleet-catalog",
    "proveedores": "fleet-catalog",
    "tipos-costo": "fleet-catalog",
    "operaciones": "operations",
    "nomina": "costs",
    "costos-administrativos": "costs",
    "costos-vehiculo": "costs",
    "costos-financieros": "costs",
    "tickets": "evidence-tickets",
    "siigo": "external-accounting",
}

ENTITY_CONTEXT_MAP: dict[str, str] = {
    "Usuario": "identity-access",
    "Rol": "identity-access",
    "UsuarioPendienteActivacion": "identity-access",
    "Vehiculo": "fleet-catalog",
    "LineaNegocio": "fleet-catalog",
    "Material": "fleet-catalog",
    "Proveedor": "fleet-catalog",
    "TipoCosto": "fleet-catalog",
    "Operacion": "operations",
    "Nomina": "costs",
    "CostoAdministrativo": "costs",
    "CostoVehiculo": "costs",
    "CostoFinancieroOtrosGastos": "costs",
    "Ticket": "evidence-tickets",
    "TicketAuditoria": "evidence-tickets",
}

# Domain catalog categories → relevance (DOMAIN_MODEL.md)
ENTITY_CATEGORY: dict[str, str] = {
    "Usuario": "identidad",
    "Rol": "identidad",
    "UsuarioPendienteActivacion": "identidad",
    "LineaNegocio": "maestros",
    "Material": "maestros",
    "Proveedor": "maestros",
    "TipoCosto": "maestros",
    "Vehiculo": "maestros",
    "Operacion": "transacciones_operativas",
    "Nomina": "transacciones_costo",
    "CostoAdministrativo": "transacciones_costo",
    "CostoVehiculo": "transacciones_costo",
    "CostoFinancieroOtrosGastos": "transacciones_costo",
    "Ticket": "documentos",
    "TicketAuditoria": "documentos",
}

# Tables marked as technical / non-domain in AIKB ENTITIES.md / DOMAIN_MODEL.md
TECHNICAL_DB_HINTS = {
    "Ticket_Contenido": "Persistencia LONGBLOB; no domain record",
}

TABLE_NAME_ALIASES = {
    "Operacion": "Operaciones_Lineas_Negocio",
    "LineaNegocio": "Linea_Negocio",
    "TipoCosto": "Tipo_Costo",
    "CostoAdministrativo": "Costo_Administrativo",
    "CostoVehiculo": "Costo_Vehiculo",
    "CostoFinancieroOtrosGastos": "Costo_Financiero_OtrosGastos",
    "TicketAuditoria": "Ticket_Auditoria",
    "CuentaAutenticacion": "Cuenta_Autenticacion",
}


class ArchitectureInterpreter:
    """Transform AIKB knowledge into an ArchitectureModel (no invention)."""

    def __init__(self) -> None:
        self.classifier = LayerClassifier()
        self._pending_fk: list[tuple[str, str, str]] = []

    def interpret(self, knowledge: ProjectKnowledge) -> ArchitectureModel:
        model = ArchitectureModel(
            system_name=knowledge.name,
            system_description=knowledge.full_name,
        )

        self._load_architecture_style(knowledge, model)
        self._build_actors(knowledge, model)
        self._build_system_and_containers(knowledge, model)
        self._build_externals(knowledge, model)
        self._build_bounded_contexts(knowledge, model)
        self._build_modules_services_repos(knowledge, model)
        self._build_domain_entities(knowledge, model)
        self._build_database_entities(knowledge, model)
        self._build_relationships(knowledge, model)
        self._build_context_level_rels(model)
        self._build_container_level_rels(model)
        self._build_component_level_rels(model)

        logger.info(
            "ArchitectureModel: %s containers, %s modules, %s domain entities, %s DB tables, %s contexts",
            len(model.containers),
            len(model.modules),
            len(model.domain_entities),
            len(model.database_entities),
            len(model.bounded_contexts),
        )
        return model

    def _doc(self, knowledge: ProjectKnowledge, relative: str) -> dict[str, Any] | None:
        return knowledge.markdown_docs.get(relative)

    def _body(self, knowledge: ProjectKnowledge, relative: str) -> str:
        doc = self._doc(knowledge, relative)
        return (doc or {}).get("body") or ""

    def _load_architecture_style(
        self,
        knowledge: ProjectKnowledge,
        model: ArchitectureModel,
    ) -> None:
        body = self._body(knowledge, "01_ARCHITECTURE/ARCHITECTURE.md")
        if not body:
            model.add_warning("01_ARCHITECTURE/ARCHITECTURE.md")
            return

        model.style = "Clean Architecture + Hexagonal (backend); Feature-sliced (frontend)"
        model.notes.append(
            "Backend: interfaces.rest → application → domain; infrastructure adapta ports"
        )

        rows = first_matching_table(body, {"capa", "responsabilidad"})
        for row in rows:
            capa = strip_md(row.get("capa", ""))
            resp = strip_md(row.get("responsabilidad", ""))
            if capa and resp:
                model.layer_responsibilities[capa] = resp

    def _build_actors(
        self,
        knowledge: ProjectKnowledge,
        model: ArchitectureModel,
    ) -> None:
        # Evidence: 10_DIAGRAMS/c4-context.md and ARCHITECTURE.md C4 resumen
        actor_roles: list[str] = []
        for path in (
            "10_DIAGRAMS/c4-context.md",
            "01_ARCHITECTURE/ARCHITECTURE.md",
        ):
            body = self._body(knowledge, path)
            match = re.search(
                r"Admin\s*/\s*Contador\s*/\s*Conductor(?:\s*/\s*Registrado)?",
                body,
                flags=re.IGNORECASE,
            )
            if match:
                actor_roles = [
                    role.strip()
                    for role in re.split(r"\s*/\s*", match.group(0))
                ]
                break

        if not actor_roles:
            model.add_warning("actor roles for C4 context")
            actor_roles = ["Usuarios"]

        model.actors.append(
            ArchElement(
                id="actor:users",
                name="Usuarios",
                kind=ElementKind.ACTOR,
                responsibility="Operan el portal según rol",
                description=", ".join(actor_roles),
                architectural_level=ArchLevel.CONTEXT,
                layer=ArchLayer.EXTERNAL,
                tags=actor_roles,
                evidence=["10_DIAGRAMS/c4-context.md", "01_ARCHITECTURE/ARCHITECTURE.md"],
            )
        )

    def _build_system_and_containers(
        self,
        knowledge: ProjectKnowledge,
        model: ArchitectureModel,
    ) -> None:
        tech = knowledge.tech_stack or {}
        frontend = tech.get("frontend") or {}
        fe_tech = ", ".join(f"{k} {v}" for k, v in frontend.items()) if frontend else "React SPA"
        be_tech_parts = []
        if tech.get("java"):
            be_tech_parts.append(f"Java {tech['java']}")
        if tech.get("maven_parent"):
            be_tech_parts.append(str(tech["maven_parent"]))
        be_tech = ", ".join(be_tech_parts) if be_tech_parts else "Spring Boot"

        model.systems.append(
            ArchElement(
                id="system:rycapp",
                name=knowledge.name,
                kind=ElementKind.SYSTEM,
                responsibility="Portal operativo de transporte (catálogos, operaciones, costos, tickets, Siigo)",
                description=knowledge.full_name,
                architectural_level=ArchLevel.CONTEXT,
                evidence=["11_METADATA/llm-index.json", "00_PROJECT/PROJECT.md"],
            )
        )

        spa_resp = model.layer_responsibilities.get("Frontend") or (
            "UI por features; Page → Store → API HTTP"
        )
        # Prefer documented frontend flow
        if "frontend" in self._body(knowledge, "01_ARCHITECTURE/ARCHITECTURE.md").lower():
            spa_resp = "Feature-sliced UI: Page → Zustand Store → api.ts → Backend /api/**"

        model.containers.extend(
            [
                ArchElement(
                    id="container:spa",
                    name="Frontend React SPA",
                    kind=ElementKind.CONTAINER,
                    technology=fe_tech,
                    responsibility=spa_resp,
                    location="frontend/",
                    architectural_level=ArchLevel.CONTAINER,
                    layer=ArchLayer.PRESENTATION,
                    parent_id="system:rycapp",
                    evidence=["01_ARCHITECTURE/ARCHITECTURE.md", "11_METADATA/dependencies.json"],
                ),
                ArchElement(
                    id="container:api",
                    name="Backend Spring Boot",
                    kind=ElementKind.CONTAINER,
                    technology=be_tech,
                    responsibility=(
                        "API REST + orquestación Clean/Hexagonal "
                        "(interfaces → application → domain ← infrastructure)"
                    ),
                    location="backend/",
                    architectural_level=ArchLevel.CONTAINER,
                    layer=ArchLayer.APPLICATION,
                    parent_id="system:rycapp",
                    evidence=["01_ARCHITECTURE/ARCHITECTURE.md", "11_METADATA/dependencies.json"],
                ),
                ArchElement(
                    id="container:db",
                    name="MySQL",
                    kind=ElementKind.CONTAINER,
                    technology="MySQL (InnoDB, utf8mb4) / Flyway",
                    responsibility="Persistencia relacional del monolito modular",
                    location="backend/src/main/resources/db/migration/",
                    architectural_level=ArchLevel.CONTAINER,
                    layer=ArchLayer.INFRASTRUCTURE,
                    parent_id="system:rycapp",
                    evidence=["05_DATABASE/PHYSICAL_MODEL.md", "10_DIAGRAMS/c4-context.md"],
                ),
            ]
        )

    def _build_externals(
        self,
        knowledge: ProjectKnowledge,
        model: ArchitectureModel,
    ) -> None:
        if not knowledge.integrations:
            model.add_warning("integrations for external systems")
            return

        for integration in knowledge.integrations:
            tech_bits = list(integration.ports or []) + list(integration.classes or [])
            # PDF is an outbound conversion port; still listed as integration in AIKB
            responsibility = None
            if integration.stage:
                responsibility = f"Integración ({integration.stage})"
            elif integration.id == "mail":
                responsibility = "SMTP OTP / notificaciones de cuenta"
            elif integration.id == "pdf":
                responsibility = "Conversión imagen→PDF vía PdfConversionPort"
            elif integration.id == "siigo":
                responsibility = "Consulta/verificación contable externa"

            model.external_systems.append(
                ArchElement(
                    id=f"external:{integration.id}",
                    name=integration.id.capitalize() if integration.id != "siigo" else "Siigo API",
                    kind=ElementKind.EXTERNAL_SYSTEM,
                    technology=", ".join(tech_bits) if tech_bits else None,
                    responsibility=responsibility,
                    location=integration.doc,
                    description=integration.stage,
                    architectural_level=ArchLevel.CONTEXT,
                    layer=ArchLayer.EXTERNAL,
                    evidence=[integration.doc or "11_METADATA/integrations.json"],
                    tags=[integration.id],
                )
            )

    def _build_bounded_contexts(
        self,
        knowledge: ProjectKnowledge,
        model: ArchitectureModel,
    ) -> None:
        body = self._body(knowledge, "02_DOMAIN/BOUNDED_CONTEXTS.md")
        rows = first_matching_table(body, {"contexto", "núcleo"}) if body else []
        if not rows:
            rows = first_matching_table(body, {"contexto", "nucleo"}) if body else []

        if rows:
            for row in rows:
                name = strip_md(row.get("contexto") or row.get("context") or "")
                core = strip_md(row.get("núcleo") or row.get("nucleo") or "")
                relations = strip_md(row.get("relaciones") or "")
                if not name:
                    continue
                ctx_id = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
                cores = [c.strip() for c in re.split(r"[,/]", core) if c.strip()]
                modules = [
                    mid
                    for mid, mapped in MODULE_CONTEXT_MAP.items()
                    if mapped == ctx_id
                    or mapped.replace("-", " ") in name.lower()
                    or any(token in name.lower() for token in mapped.split("-")[:1])
                ]
                # Fallback module association by known map keys matching context tokens
                if not modules:
                    modules = [
                        mid
                        for mid, cid in MODULE_CONTEXT_MAP.items()
                        if cid in ctx_id or ctx_id in cid
                    ]
                model.bounded_contexts.append(
                    BoundedContext(
                        id=f"ctx:{ctx_id}",
                        name=name,
                        core_entities=cores,
                        modules=modules,
                        relations=relations or None,
                        evidence=["02_DOMAIN/BOUNDED_CONTEXTS.md"],
                    )
                )
        else:
            # Fallback: synthesize contexts only from MODULE_CONTEXT_MAP labels documented elsewhere
            model.add_warning("bounded context table rows")
            labels = {
                "identity-access": "Identity & Access",
                "fleet-catalog": "Fleet & Catalog",
                "operations": "Operations",
                "costs": "Costs",
                "evidence-tickets": "Evidence (Tickets)",
                "external-accounting": "External Accounting (Siigo)",
            }
            for ctx_id, label in labels.items():
                modules = [m for m, c in MODULE_CONTEXT_MAP.items() if c == ctx_id]
                entities = [e for e, c in ENTITY_CONTEXT_MAP.items() if c == ctx_id]
                model.bounded_contexts.append(
                    BoundedContext(
                        id=f"ctx:{ctx_id}",
                        name=label,
                        core_entities=entities,
                        modules=modules,
                        evidence=["02_DOMAIN/BOUNDED_CONTEXTS.md (inferred map)"],
                    )
                )

        # Normalize module lists using MODULE_CONTEXT_MAP (authoritative map aligned to AIKB)
        by_id = {c.id.removeprefix("ctx:"): c for c in model.bounded_contexts}
        for module_id, ctx_key in MODULE_CONTEXT_MAP.items():
            ctx = by_id.get(ctx_key)
            if ctx and module_id not in ctx.modules:
                ctx.modules.append(module_id)

    def _parse_module_catalog(
        self,
        knowledge: ProjectKnowledge,
    ) -> dict[str, dict[str, str]]:
        body = self._body(knowledge, "01_ARCHITECTURE/MODULES.md")
        rows = first_matching_table(body, {"módulo", "service", "controller"})
        catalog: dict[str, dict[str, str]] = {}
        if not rows:
            return catalog

        for row in rows:
            module_name = strip_md(row.get("módulo") or row.get("modulo") or "")
            if not module_name:
                continue
            # Map Spanish display names to module ids
            key = self._module_key(module_name)
            catalog[key] = {
                "port_in": strip_md(row.get("port in") or ""),
                "service": strip_md(row.get("service") or ""),
                "controller": strip_md(row.get("controller") or ""),
                "persistence": strip_md(row.get("persistencia") or ""),
                "display": module_name,
            }
        return catalog

    def _module_key(self, display: str) -> str:
        mapping = {
            "auth": "auth",
            "usuarios": "usuarios",
            "roles": "roles",
            "líneas de negocio": "lineas-negocio",
            "lineas de negocio": "lineas-negocio",
            "materiales": "materiales",
            "proveedores": "proveedores",
            "tipos de costo": "tipos-costo",
            "vehículos": "vehiculos",
            "vehiculos": "vehiculos",
            "operaciones": "operaciones",
            "nómina": "nomina",
            "nomina": "nomina",
            "costo administrativo": "costos-administrativos",
            "costo vehículo": "costos-vehiculo",
            "costo vehiculo": "costos-vehiculo",
            "costo financiero": "costos-financieros",
            "tickets": "tickets",
            "siigo": "siigo",
        }
        return mapping.get(display.lower().strip(), display.lower().replace(" ", "-"))

    def _build_modules_services_repos(
        self,
        knowledge: ProjectKnowledge,
        model: ArchitectureModel,
    ) -> None:
        catalog = self._parse_module_catalog(knowledge)

        for module in knowledge.modules:
            ctx = MODULE_CONTEXT_MAP.get(module.id)
            info = catalog.get(module.id, {})
            controller = module.controller or info.get("controller") or None
            service = info.get("service") or None
            port_in = info.get("port_in") or None
            persistence = info.get("persistence") or None

            responsibility_parts = []
            if controller:
                responsibility_parts.append(f"API: {controller}")
            if service:
                responsibility_parts.append(f"App: {service}")
            if persistence:
                responsibility_parts.append(f"Out: {persistence}")
            if module.note:
                responsibility_parts.append(module.note)

            mod_el = ArchElement(
                id=f"module:{module.id}",
                name=module.id,
                kind=ElementKind.MODULE,
                responsibility="; ".join(responsibility_parts) or None,
                location=module.backend_doc or module.frontend,
                description=info.get("display"),
                architectural_level=ArchLevel.COMPONENT,
                layer=ArchLayer.APPLICATION if module.has_backend else ArchLayer.PRESENTATION,
                parent_id="container:api" if module.has_backend else "container:spa",
                bounded_context=ctx,
                evidence=[
                    "11_METADATA/modules.json",
                    module.backend_doc or "",
                    "01_ARCHITECTURE/MODULES.md",
                ],
                metadata={
                    "controller": controller,
                    "service": service,
                    "port_in": port_in,
                    "persistence": persistence,
                    "frontend": module.frontend,
                },
            )
            if not mod_el.responsibility:
                model.add_warning(f"responsibility for module {module.id}")
            model.modules.append(mod_el)

            # Interface component (controller)
            if controller and "ausente" not in controller.lower() and controller != "*(ausente)*":
                model.components.append(
                    ArchElement(
                        id=f"component:{controller}",
                        name=controller,
                        kind=ElementKind.COMPONENT,
                        responsibility=f"Adaptador HTTP REST del módulo {module.id}",
                        location="interfaces.rest",
                        architectural_level=ArchLevel.COMPONENT,
                        layer=self.classifier.classify_controller(controller),
                        parent_id=mod_el.id,
                        bounded_context=ctx,
                        evidence=["01_ARCHITECTURE/MODULES.md", "11_METADATA/apis.json"],
                        tags=["controller", "interface"],
                    )
                )

            # Application service / use case
            if service and "ausente" not in service.lower():
                model.services.append(
                    ArchElement(
                        id=f"service:{service}",
                        name=service,
                        kind=ElementKind.SERVICE,
                        responsibility=(
                            f"Orquestación y reglas del módulo {module.id}"
                            + (f" (port-in: {port_in})" if port_in and "ausente" not in port_in.lower() else "")
                        ),
                        location="application.service",
                        architectural_level=ArchLevel.COMPONENT,
                        layer=self.classifier.classify_service(service),
                        parent_id=mod_el.id,
                        bounded_context=ctx,
                        evidence=["01_ARCHITECTURE/MODULES.md"],
                        tags=["service", "application"],
                        metadata={"port_in": port_in},
                    )
                )

            # Repository / ports out
            if persistence:
                for token in re.split(r"[+/]", persistence):
                    token = token.strip()
                    if not token or "ausente" in token.lower():
                        continue
                    is_repo = "repository" in token.lower() or token.endswith("Repository")
                    is_port = token.endswith("Port")
                    kind = ElementKind.REPOSITORY if is_repo else ElementKind.COMPONENT
                    layer = (
                        self.classifier.classify_repository(token)
                        if is_repo or is_port
                        else ArchLayer.INFRASTRUCTURE
                    )
                    target = model.repositories if is_repo else model.components
                    target.append(
                        ArchElement(
                            id=f"{'repo' if is_repo else 'port'}:{token}",
                            name=token,
                            kind=kind,
                            responsibility=(
                                "Puerto/adaptador de persistencia"
                                if is_repo
                                else "Puerto de integración/salida"
                            ),
                            location="application.ports.out / infrastructure",
                            architectural_level=ArchLevel.CODE if is_repo else ArchLevel.COMPONENT,
                            layer=layer,
                            parent_id=mod_el.id,
                            bounded_context=ctx,
                            evidence=["01_ARCHITECTURE/MODULES.md"],
                            tags=["persistence" if is_repo else "port-out"],
                        )
                    )

        # Use cases from metadata as code-level interfaces
        for use_case in knowledge.use_cases:
            if use_case.id.endswith("*"):
                continue
            if any(s.name == use_case.id for s in model.services):
                continue
            layer, _ = self.classifier.classify(use_case.id, use_case.location, "usecase")
            model.components.append(
                ArchElement(
                    id=f"usecase:{use_case.id}",
                    name=use_case.id,
                    kind=ElementKind.COMPONENT,
                    responsibility="Contrato de caso de uso (port-in)",
                    location=use_case.location,
                    architectural_level=ArchLevel.CODE,
                    layer=layer if layer != ArchLayer.UNKNOWN else ArchLayer.APPLICATION,
                    evidence=["11_METADATA/use-cases.json"],
                    tags=["usecase", "port-in"],
                )
            )

    def _build_domain_entities(
        self,
        knowledge: ProjectKnowledge,
        model: ArchitectureModel,
    ) -> None:
        body = self._body(knowledge, "02_DOMAIN/DOMAIN_MODEL.md")
        # Skip non-entities documented as constants
        skip = {"UsuarioEstados"}
        for entity in knowledge.entities:
            if entity.id in skip:
                continue
            category = ENTITY_CATEGORY.get(entity.id)
            ctx = ENTITY_CONTEXT_MAP.get(entity.id)
            # Mark aggregates lightly: Operacion, Ticket are central transactional roots per docs
            tags = ["entity"]
            if entity.id in {"Operacion", "Ticket", "Usuario", "Vehiculo"}:
                tags.append("aggregate-candidate")
            # Anemic domain noted in ARCHITECTURE — no rich aggregates
            model.domain_entities.append(
                ArchElement(
                    id=f"entity:{entity.id}",
                    name=entity.id,
                    kind=ElementKind.DOMAIN_ENTITY,
                    responsibility=category or "Entidad de dominio",
                    location=entity.path,
                    description=(
                        f"Campos: {', '.join(entity.fields)}"
                        if entity.fields
                        else None
                    ),
                    architectural_level=ArchLevel.DOMAIN,
                    layer=self.classifier.classify_entity(entity.id, entity.path),
                    bounded_context=ctx,
                    evidence=["11_METADATA/entities.json", "02_DOMAIN/DOMAIN_MODEL.md"],
                    tags=tags,
                    metadata={
                        "fields": entity.fields,
                        "category": category,
                        "pk": "id" if "id" in entity.fields else None,
                    },
                )
            )

        if "CuentaAutenticacion" not in {e.name for e in model.domain_entities}:
            # Documented as infrastructure concept — expose as note only in domain filter skip
            model.notes.append(
                "CuentaAutenticacion: concepto de infraestructura (no en domain.model)"
            )

        if not body:
            model.add_warning("02_DOMAIN/DOMAIN_MODEL.md for domain enrichment")

    def _build_database_entities(
        self,
        knowledge: ProjectKnowledge,
        model: ArchitectureModel,
    ) -> None:
        # Prefer ER Mermaid from AIKB diagrams
        er_body = None
        for key, body in knowledge.extracted_diagrams.items():
            if "erDiagram" in body:
                er_body = body
                break

        tables: dict[str, ArchElement] = {}
        fk_rels: list[tuple[str, str, str]] = []

        if er_body:
            for match in re.finditer(
                r"(\w+)\s+([\|\}][^\s:]*)\s+(\w+)\s*:\s*([^\n]+)",
                er_body,
            ):
                left, card, right, label = match.groups()
                label = label.strip()
                for name in (left, right):
                    if name not in tables:
                        technical = name in TECHNICAL_DB_HINTS
                        tables[name] = ArchElement(
                            id=f"table:{name}",
                            name=name,
                            kind=ElementKind.DATABASE_ENTITY,
                            responsibility=(
                                TECHNICAL_DB_HINTS[name]
                                if technical
                                else "Tabla de persistencia"
                            ),
                            location="MySQL / Flyway",
                            architectural_level=ArchLevel.DATA,
                            layer=ArchLayer.INFRASTRUCTURE,
                            evidence=["10_DIAGRAMS/database-er.md"],
                            tags=["technical"] if technical else ["table"],
                            metadata={
                                "pk": "id",
                                "technical": technical,
                                "cardinality_raw": card,
                            },
                        )
                fk_rels.append((left, right, label or "FK"))

        logical = self._body(knowledge, "05_DATABASE/LOGICAL_MODEL.md")
        if logical:
            for alias, table in TABLE_NAME_ALIASES.items():
                if table not in tables and alias in {e.name for e in model.domain_entities}:
                    tables[table] = ArchElement(
                        id=f"table:{table}",
                        name=table,
                        kind=ElementKind.DATABASE_ENTITY,
                        responsibility=f"Persistencia de {alias}",
                        location="05_DATABASE/LOGICAL_MODEL.md",
                        architectural_level=ArchLevel.DATA,
                        layer=ArchLayer.INFRASTRUCTURE,
                        evidence=["05_DATABASE/LOGICAL_MODEL.md"],
                        tags=["table"],
                        metadata={"pk": "id", "domain_entity": alias},
                    )

        if not tables:
            model.add_warning(
                "ER diagram tables; using domain entity names as logical tables"
            )
            for entity in model.domain_entities:
                table = TABLE_NAME_ALIASES.get(entity.name, entity.name)
                tables[table] = ArchElement(
                    id=f"table:{table}",
                    name=table,
                    kind=ElementKind.DATABASE_ENTITY,
                    responsibility=f"Tabla alineada a {entity.name}",
                    architectural_level=ArchLevel.DATA,
                    layer=ArchLayer.INFRASTRUCTURE,
                    evidence=["11_METADATA/entities.json"],
                    tags=["table"],
                    metadata={"pk": "id", "domain_entity": entity.name},
                )

        model.database_entities = list(tables.values())
        self._pending_fk = fk_rels

    def _build_relationships(
        self,
        knowledge: ProjectKnowledge,
        model: ArchitectureModel,
    ) -> None:
        # Domain relationships from metadata
        for index, relation in enumerate(knowledge.relationships):
            src = f"entity:{relation.source}"
            dst = f"entity:{relation.target}"
            if model.element_by_id(src) is None or model.element_by_id(dst) is None:
                # CuentaAutenticacion may be missing as domain entity
                model.add_warning(
                    f"domain relationship endpoint ({relation.source}→{relation.target})"
                )
                continue
            model.relationships.append(
                ArchRelationship(
                    id=f"rel:domain:{index}",
                    source_id=src,
                    target_id=dst,
                    rel_type=relation.rel_type,
                    label=relation.role or relation.rel_type,
                    architectural_level=ArchLevel.DOMAIN,
                    evidence=["11_METADATA/relationships.json"],
                )
            )

        # DB FK relationships
        for index, (left, right, label) in enumerate(getattr(self, "_pending_fk", [])):
            model.relationships.append(
                ArchRelationship(
                    id=f"rel:db:{index}",
                    source_id=f"table:{left}",
                    target_id=f"table:{right}",
                    rel_type="fk",
                    label=label,
                    architectural_level=ArchLevel.DATA,
                    evidence=["10_DIAGRAMS/database-er.md"],
                )
            )

        # Internal module layer wiring: Controller → Service → Repository
        for module in model.modules:
            meta = module.metadata or {}
            controller = meta.get("controller")
            service = meta.get("service")
            persistence = meta.get("persistence") or ""
            if controller and service and "ausente" not in str(service).lower():
                c_id = f"component:{controller}"
                s_id = f"service:{service}"
                if model.element_by_id(c_id) and model.element_by_id(s_id):
                    model.relationships.append(
                        ArchRelationship(
                            id=f"rel:cmp:{module.name}:ctrl-svc",
                            source_id=c_id,
                            target_id=s_id,
                            rel_type="calls",
                            label="orquesta",
                            architectural_level=ArchLevel.COMPONENT,
                            evidence=["01_ARCHITECTURE/ARCHITECTURE.md"],
                        )
                    )
            if service and persistence:
                s_id = f"service:{service}"
                for token in re.split(r"[+/]", persistence):
                    token = token.strip()
                    if not token or not token.endswith("Repository"):
                        continue
                    r_id = f"repo:{token}"
                    if model.element_by_id(s_id) and model.element_by_id(r_id):
                        model.relationships.append(
                            ArchRelationship(
                                id=f"rel:cmp:{module.name}:svc-{token}",
                                source_id=s_id,
                                target_id=r_id,
                                rel_type="depends",
                                label="persistencia",
                                architectural_level=ArchLevel.COMPONENT,
                                evidence=["01_ARCHITECTURE/MODULES.md"],
                            )
                        )

    def _build_context_level_rels(self, model: ArchitectureModel) -> None:
        if not model.actors or not model.systems:
            return
        actor = model.actors[0]
        system = model.systems[0]
        model.relationships.append(
            ArchRelationship(
                id="rel:ctx:users-system",
                source_id=actor.id,
                target_id=system.id,
                rel_type="uses",
                label="Usa",
                description="HTTPS / portal operativo",
                architectural_level=ArchLevel.CONTEXT,
                evidence=["10_DIAGRAMS/c4-context.md"],
            )
        )
        for external in model.external_systems:
            # PDF/Mail/Siigo are used by the system
            model.relationships.append(
                ArchRelationship(
                    id=f"rel:ctx:sys-{external.tags[0] if external.tags else external.name}",
                    source_id=system.id,
                    target_id=external.id,
                    rel_type="integrates",
                    label=external.responsibility or "Integra",
                    architectural_level=ArchLevel.CONTEXT,
                    evidence=external.evidence,
                )
            )

    def _build_container_level_rels(self, model: ArchitectureModel) -> None:
        ids = {c.id for c in model.containers}
        if not model.actors:
            return
        actor = model.actors[0]
        pairs = [
            (actor.id, "container:spa", "usa", "HTTPS"),
            ("container:spa", "container:api", "calls", "REST JSON / multipart"),
            ("container:api", "container:db", "reads/writes", "JDBC / JPA"),
        ]
        for source, target, rel_type, label in pairs:
            if target not in ids and not target.startswith("actor:"):
                continue
            model.relationships.append(
                ArchRelationship(
                    id=f"rel:ctr:{source}->{target}",
                    source_id=source,
                    target_id=target,
                    rel_type=rel_type,
                    label=label,
                    architectural_level=ArchLevel.CONTAINER,
                    evidence=["01_ARCHITECTURE/ARCHITECTURE.md", "10_DIAGRAMS/c4-containers.md"],
                )
            )
        for external in model.external_systems:
            model.relationships.append(
                ArchRelationship(
                    id=f"rel:ctr:api->{external.id}",
                    source_id="container:api",
                    target_id=external.id,
                    rel_type="integrates",
                    label=external.name,
                    architectural_level=ArchLevel.CONTAINER,
                    evidence=external.evidence,
                )
            )

    def _build_component_level_rels(self, model: ArchitectureModel) -> None:
        # Modules depend on DB container (backend modules)
        for module in model.modules:
            if module.parent_id != "container:api":
                continue
            model.relationships.append(
                ArchRelationship(
                    id=f"rel:mod:{module.name}->db",
                    source_id=module.id,
                    target_id="container:db",
                    rel_type="persists",
                    label="JPA",
                    architectural_level=ArchLevel.COMPONENT,
                    evidence=["01_ARCHITECTURE/MODULES.md"],
                )
            )
            if module.name == "siigo":
                ext = next(
                    (e for e in model.external_systems if "siigo" in (e.tags or [])),
                    None,
                )
                if ext:
                    model.relationships.append(
                        ArchRelationship(
                            id="rel:mod:siigo->ext",
                            source_id=module.id,
                            target_id=ext.id,
                            rel_type="integrates",
                            label="API Siigo",
                            architectural_level=ArchLevel.COMPONENT,
                            evidence=["03_BACKEND/SIIGO.md", "08_INTEGRATIONS/SIIGO.md"],
                        )
                    )
