"""Complexity analyzer — oversized components / god modules."""

from __future__ import annotations

from architecture_engine.analyzers.models import Finding, Severity
from architecture_engine.models import ArchitectureModel


class ComplexityAnalyzer:
    """Detect components that are excessively large according to AIKB facts."""

    MAX_FIELDS = 14
    MAX_API_PER_CONTROLLER = 12
    MAX_MODULES_PER_CONTEXT = 7
    MAX_SURFACE = 8

    def analyze(self, model: ArchitectureModel) -> list[Finding]:
        findings: list[Finding] = []

        # Large domain entities
        for entity in model.domain_entities:
            fields = (entity.metadata or {}).get("fields") or []
            if len(fields) >= self.MAX_FIELDS:
                findings.append(
                    Finding(
                        id=f"CX-ENT-{entity.name}",
                        analyzer="complexity",
                        severity=Severity.MEDIUM,
                        title=f"Entidad compleja: '{entity.name}' ({len(fields)} campos)",
                        detail=f"Campos: {', '.join(fields)}",
                        evidence=["11_METADATA/entities.json"],
                        recommendation=(
                            "Evaluar split de value objects o separar proyecciones "
                            "de lectura si el modelo sigue creciendo."
                        ),
                        metadata={"fields": len(fields)},
                    )
                )

        # Controllers with many endpoints (from components metadata + apis via modules)
        # Count APIs grouped by controller name from module metadata
        controller_load: dict[str, int] = {}
        for module in model.modules:
            controller = (module.metadata or {}).get("controller")
            if not controller:
                continue
            # approximate: services/repos/ports in persistence string
            persistence = str((module.metadata or {}).get("persistence") or "")
            ports = [p.strip() for p in persistence.replace("+", "/").split("/") if p.strip()]
            controller_load[controller] = max(
                controller_load.get(controller, 0),
                len(ports) + (1 if (module.metadata or {}).get("service") else 0),
            )

        # Use graph nodes / model components tagged controller — prefer counting children
        for module in model.modules:
            meta = module.metadata or {}
            surface = 0
            if meta.get("controller"):
                surface += 1
            if meta.get("service"):
                surface += 1
            if meta.get("port_in") and "ausente" not in str(meta.get("port_in")).lower():
                surface += 1
            persistence = str(meta.get("persistence") or "")
            surface += persistence.count("Repository") + persistence.count("Port")
            if meta.get("frontend"):
                surface += 1
            if surface >= self.MAX_SURFACE:
                findings.append(
                    Finding(
                        id=f"CX-MOD-{module.name}",
                        analyzer="complexity",
                        severity=Severity.MEDIUM,
                        title=f"Módulo de alta superficie: '{module.name}'",
                        detail=(
                            f"Combina {surface} artefactos documentados "
                            f"(controller/service/ports/frontend)."
                        ),
                        evidence=["01_ARCHITECTURE/MODULES.md"],
                        recommendation=(
                            "Si el módulo concentra demasiada superficie, "
                            "extraer sub-capacidades dentro del bounded context."
                        ),
                        metadata={"surface": surface},
                    )
                )

        # Bounded context size
        from collections import defaultdict

        by_ctx: dict[str, list[str]] = defaultdict(list)
        for module in model.modules:
            if module.bounded_context and module.parent_id == "container:api":
                by_ctx[module.bounded_context].append(module.name)
        for ctx, names in by_ctx.items():
            if len(names) >= self.MAX_MODULES_PER_CONTEXT:
                findings.append(
                    Finding(
                        id=f"CX-CTX-{ctx}",
                        analyzer="complexity",
                        severity=Severity.LOW,
                        title=f"Bounded context amplio: '{ctx}' ({len(names)} módulos)",
                        detail=f"Módulos: {', '.join(sorted(names))}",
                        evidence=["02_DOMAIN/BOUNDED_CONTEXTS.md"],
                        recommendation=(
                            "Revisar si el contexto debe particionarse "
                            "(p.ej. catálogos vs flota)."
                        ),
                    )
                )

        # Unused / thin modules (dashboard FE-only with no backend)
        for module in model.modules:
            meta = module.metadata or {}
            if (
                not meta.get("controller")
                and not meta.get("service")
                and module.parent_id == "container:spa"
            ):
                findings.append(
                    Finding(
                        id=f"CX-UNUSED-{module.name}",
                        analyzer="complexity",
                        severity=Severity.LOW,
                        title=f"Módulo delgado / FE-only: '{module.name}'",
                        detail=(
                            "Sin controller/service backend en AIKB "
                            "(posible dashboard o scaffold)."
                        ),
                        evidence=["11_METADATA/modules.json"],
                        recommendation=(
                            "Confirmar si el módulo aporta capacidad real o "
                            "debe consolidarse en otra feature."
                        ),
                    )
                )

        return findings
