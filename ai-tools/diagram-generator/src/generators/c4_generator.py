"""Professional C4 Model generator (PlantUML C4-PlantUML + Mermaid)."""

from __future__ import annotations

import re

from architecture_engine.models import ArchitectureModel
from architecture_engine.selectors import ViewSelector
from generators.annotations_render import mermaid_header, plantuml_header
from visualization_engine.engine import VisualizationEngine


def _sid(value: str) -> str:
    cleaned = re.sub(r"[^A-Za-z0-9_]", "_", value)
    if cleaned and cleaned[0].isdigit():
        cleaned = f"N_{cleaned}"
    return cleaned or "node"


def _escape(text: str | None) -> str:
    if not text:
        return ""
    return text.replace('"', "'").replace("\n", " ")


class C4Generator:
    """Generate C4 Levels 1–4 from ArchitectureModel."""

    def __init__(self, model: ArchitectureModel, *, version: str | None = None) -> None:
        self.model = model
        self.selector = ViewSelector()
        self.viz = VisualizationEngine(version=version)

    def context(self) -> str:
        document = self.viz.compose(self.model, "c4-context")
        view = self.selector.c4_context(self.model)
        system = self.model.systems[0] if self.model.systems else None
        lines = [
            "@startuml",
            *plantuml_header(document),
            "!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Context.puml",
            f"title {document.annotation.title} — {self.model.system_name}",
            "LAYOUT_WITH_LEGEND()",
        ]
        for actor in self.model.actors:
            lines.append(
                f'Person({_sid(actor.id)}, "{_escape(actor.name)}", '
                f'"{_escape(actor.description or actor.responsibility)}")'
            )
        if system:
            lines.append(
                f'System({_sid(system.id)}, "{_escape(system.name)}", '
                f'"{_escape(system.responsibility)}")'
            )
        for external in self.model.external_systems:
            lines.append(
                f'System_Ext({_sid(external.id)}, "{_escape(external.name)}", '
                f'"{_escape(external.responsibility or external.technology)}")'
            )
        for rel in view.relationships:
            lines.append(
                f'Rel({_sid(rel.source_id)}, {_sid(rel.target_id)}, '
                f'"{_escape(rel.label or rel.rel_type)}")'
            )
        for note in view.notes:
            lines.append(f"legend right\n  {_escape(note)}\nendlegend")
        lines.append("@enduml")
        return "\n".join(lines) + "\n"

    def container(self) -> str:
        document = self.viz.compose(self.model, "c4-container")
        view = self.selector.c4_container(self.model)
        lines = [
            "@startuml",
            *plantuml_header(document),
            "!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Container.puml",
            f"title {document.annotation.title} — {self.model.system_name}",
            "LAYOUT_WITH_LEGEND()",
        ]
        for actor in self.model.actors:
            lines.append(
                f'Person({_sid(actor.id)}, "{_escape(actor.name)}", '
                f'"{_escape(actor.description or "")}")'
            )
        lines.append(
            f'System_Boundary(sys, "{_escape(self.model.system_name)}") {{'
        )
        for container in self.model.containers:
            tech = _escape(container.technology or "")
            resp = _escape(container.responsibility or "")
            if container.id.endswith(":db"):
                lines.append(
                    f'  ContainerDb({_sid(container.id)}, "{_escape(container.name)}", '
                    f'"{tech}", "{resp}")'
                )
            else:
                lines.append(
                    f'  Container({_sid(container.id)}, "{_escape(container.name)}", '
                    f'"{tech}", "{resp}")'
                )
        lines.append("}")
        for external in self.model.external_systems:
            lines.append(
                f'System_Ext({_sid(external.id)}, "{_escape(external.name)}", '
                f'"{_escape(external.responsibility or external.technology)}")'
            )
        for rel in view.relationships:
            lines.append(
                f'Rel({_sid(rel.source_id)}, {_sid(rel.target_id)}, '
                f'"{_escape(rel.label or rel.rel_type)}")'
            )
        lines.append("@enduml")
        return "\n".join(lines) + "\n"

    def component(self) -> str:
        view = self.selector.component_view(self.model)
        lines = [
            "@startuml",
            "!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Component.puml",
            f"title C4 Level 3 — Backend Components — {self.model.system_name}",
            'Container_Boundary(api, "Backend Spring Boot") {',
        ]
        # Group by bounded context as nested boundaries when possible
        for ctx_name, modules in view.groups.items():
            if not modules:
                continue
            lines.append(f'  Boundary({_sid("b_"+ctx_name)}, "{_escape(ctx_name)}") {{')
            for module in modules:
                tech = "module"
                meta = module.metadata or {}
                if meta.get("controller"):
                    tech = str(meta["controller"])
                lines.append(
                    f'    Component({_sid(module.id)}, "{_escape(module.name)}", '
                    f'"{_escape(tech)}", "{_escape(module.responsibility)}")'
                )
            lines.append("  }")
        lines.append("}")
        db = next((c for c in self.model.containers if c.id == "container:db"), None)
        if db:
            lines.append(
                f'ContainerDb({_sid(db.id)}, "{_escape(db.name)}", '
                f'"{_escape(db.technology)}", "{_escape(db.responsibility)}")'
            )
        for external in self.model.external_systems:
            lines.append(
                f'System_Ext({_sid(external.id)}, "{_escape(external.name)}")'
            )
        for rel in view.relationships:
            if rel.source_id.startswith("service:"):
                continue  # keep L3 readable: module-level edges
            lines.append(
                f'Rel({_sid(rel.source_id)}, {_sid(rel.target_id)}, '
                f'"{_escape(rel.label or rel.rel_type)}")'
            )
        lines.append("@enduml")
        return "\n".join(lines) + "\n"

    def code(self) -> str:
        view = self.selector.code_view(self.model)
        lines = [
            "@startuml",
            "!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Component.puml",
            f"title C4 Level 4 — Code Diagram — {self.model.system_name}",
        ]
        for layer_name, elements in view.groups.items():
            if not elements:
                continue
            lines.append(f'Boundary({_sid("layer_"+layer_name)}, "{layer_name}") {{')
            for element in elements:
                lines.append(
                    f'  Component({_sid(element.id)}, "{_escape(element.name)}", '
                    f'"{_escape(element.layer.value)}", "{_escape(element.responsibility)}")'
                )
            lines.append("}")
        for rel in view.relationships:
            lines.append(
                f'Rel({_sid(rel.source_id)}, {_sid(rel.target_id)}, '
                f'"{_escape(rel.label or rel.rel_type)}")'
            )
        if not view.elements:
            lines.append(
                "note as N1\n  Información no disponible en AIKB: code-level elements\nend note"
            )
        lines.append("@enduml")
        return "\n".join(lines) + "\n"

    def context_mermaid(self) -> str:
        document = self.viz.compose(self.model, "c4-context")
        lines = [
            *mermaid_header(document),
            "flowchart LR",
            "  %% C4 purity: actors + systems only",
        ]
        for actor in self.model.actors:
            lines.append(
                f'  {_sid(actor.id)}(["{actor.name}\\n{actor.description or ""}"])'
            )
        for system in self.model.systems:
            lines.append(
                f'  {_sid(system.id)}["{system.name}\\n{system.responsibility or ""}"]'
            )
        for external in self.model.external_systems:
            lines.append(
                f'  {_sid(external.id)}{{{{{external.name}\\n{external.responsibility or ""}}}}}'
            )
        view = self.selector.c4_context(self.model)
        for rel in view.relationships:
            lines.append(
                f"  {_sid(rel.source_id)} -->|{rel.label or rel.rel_type}| {_sid(rel.target_id)}"
            )
        return "\n".join(lines) + "\n"

    def container_mermaid(self) -> str:
        document = self.viz.compose(self.model, "c4-container")
        lines = [
            *mermaid_header(document),
            "flowchart TB",
            "  %% C4 purity: containers + externals",
        ]
        for actor in self.model.actors:
            lines.append(f'  {_sid(actor.id)}(["{actor.name}"])')
        lines.append(f'  subgraph SYS["{self.model.system_name}"]')
        for container in self.model.containers:
            label = container.name
            if container.technology:
                label += f"\\n[{container.technology}]"
            if container.responsibility:
                # Keep label compact
                short = container.responsibility
                if len(short) > 60:
                    short = short[:57] + "..."
                label += f"\\n{short}"
            shape_open, shape_close = ('[(', ')]') if container.id.endswith(":db") else ('[', ']')
            lines.append(
                f'    {_sid(container.id)}{shape_open}"{label}"{shape_close}'
            )
        lines.append("  end")
        for external in self.model.external_systems:
            lines.append(
                f'  {_sid(external.id)}{{{{"{external.name}\\n{external.responsibility or ""}"}}}}'
            )
        view = self.selector.c4_container(self.model)
        for rel in view.relationships:
            lines.append(
                f"  {_sid(rel.source_id)} -->|{rel.label or rel.rel_type}| {_sid(rel.target_id)}"
            )
        return "\n".join(lines) + "\n"

    def generate(self, level: str) -> str:
        mapping = {
            "context": self.context,
            "container": self.container,
            "component": self.component,
            "code": self.code,
            "c4-context": self.context,
            "c4-container": self.container,
            "c4-component": self.component,
            "c4-code": self.code,
            "architecture": self.container,
        }
        generator = mapping.get(level)
        if generator is None:
            raise ValueError(f"Unsupported C4 level: {level}")
        return generator()
