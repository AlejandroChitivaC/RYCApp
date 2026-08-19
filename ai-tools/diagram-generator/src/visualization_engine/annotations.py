"""Enterprise diagram annotations (title, legend, version, date, tech)."""

from __future__ import annotations

from datetime import date

from architecture_engine.models import ArchitectureModel, ElementKind
from visualization_engine.models import DiagramAnnotation

VIEW_TITLES = {
    "c4-context": ("C4 Level 1 — System Context", "context"),
    "c4-container": ("C4 Level 2 — Container Diagram", "container"),
    "c4-component": ("C4 Level 3 — Component Diagram", "component"),
    "c4-code": ("C4 Level 4 — Code Diagram", "code"),
    "code": ("C4 Level 4 — Code Diagram", "code"),
    "architecture": ("System Architecture Overview", "container"),
    "components": ("Component View by Bounded Context", "component"),
    "domain": ("Domain Model (DDD)", "domain"),
    "database": ("Database / ER View", "data"),
    "dependencies": ("Architectural Dependencies", "container"),
    "sequence": ("Canonical Command Sequence", "component"),
}

VIEW_LEGENDS = {
    "c4-context": [
        "Person = actor humano",
        "System = sistema en alcance",
        "System_Ext = integración externa",
        "C4: no módulos ni clases en este nivel",
    ],
    "c4-container": [
        "Container = aplicación / servicio desplegable",
        "ContainerDb = almacén de datos",
        "Incluye tecnología y responsabilidad",
    ],
    "c4-component": [
        "Component = módulo / capacidad interna",
        "Agrupado por bounded context",
    ],
    "components": [
        "Módulos backend agrupados por bounded context",
        "Flechas = persistencia o integración",
    ],
    "domain": [
        "Entity / Aggregate-candidate (dominio anémico según AIKB)",
        "Paquetes = bounded contexts",
    ],
    "database": [
        "Tablas de negocio (técnicas omitidas cuando aplica)",
        "PK / FK según metadata AIKB",
    ],
}


class AnnotationBuilder:
    """Compose documentation metadata for VisualDocument."""

    def build(self, model: ArchitectureModel, view: str) -> DiagramAnnotation:
        title, c4_level = VIEW_TITLES.get(view, (f"Architecture View — {view}", None))
        technologies = self._collect_technologies(model)
        responsibilities = self._collect_responsibilities(model, view)
        subtitle = model.system_description or model.style
        notes = list(model.notes[:3])
        if model.style:
            notes.append(f"Estilo: {model.style}")

        return DiagramAnnotation(
            title=title,
            subtitle=subtitle,
            c4_level=c4_level,
            version=None,  # filled by engine from knowledge if available
            generated_on=date.today().isoformat(),
            system_name=model.system_name,
            technologies=technologies,
            legend=list(VIEW_LEGENDS.get(view, ["Arquitectura derivada de AIKB"])),
            notes=notes,
            responsibilities_summary=responsibilities,
        )

    def _collect_technologies(self, model: ArchitectureModel) -> list[str]:
        techs: list[str] = []
        for container in model.containers:
            if container.technology:
                techs.append(f"{container.name}: {container.technology}")
        for external in model.external_systems:
            if external.technology:
                techs.append(f"{external.name}: {external.technology}")
        return techs[:8]

    def _collect_responsibilities(
        self,
        model: ArchitectureModel,
        view: str,
    ) -> list[str]:
        lines: list[str] = []
        if view in {"c4-container", "architecture"}:
            for container in model.containers:
                if container.responsibility:
                    lines.append(f"{container.name}: {container.responsibility}")
        elif view in {"c4-component", "components"}:
            for module in model.modules[:10]:
                if module.responsibility:
                    short = module.responsibility
                    if len(short) > 80:
                        short = short[:77] + "..."
                    lines.append(f"{module.name}: {short}")
        elif view == "c4-context":
            for system in model.systems:
                if system.responsibility:
                    lines.append(f"{system.name}: {system.responsibility}")
            for external in model.external_systems:
                if external.responsibility:
                    lines.append(f"{external.name}: {external.responsibility}")
        return lines[:12]
