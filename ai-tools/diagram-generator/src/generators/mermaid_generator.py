"""Mermaid generator driven by ArchitectureModel views."""

from __future__ import annotations

import logging
import re

from architecture_engine.models import ArchitectureModel
from architecture_engine.selectors import ViewSelector
from generators.annotations_render import mermaid_header
from models.project import ProjectKnowledge
from visualization_engine.engine import VisualizationEngine

logger = logging.getLogger(__name__)


def _sid(value: str) -> str:
    cleaned = re.sub(r"[^A-Za-z0-9_]", "_", value)
    if cleaned and cleaned[0].isdigit():
        cleaned = f"N_{cleaned}"
    return cleaned or "node"


class MermaidGenerator:
    """Generate Mermaid diagrams from ArchitectureModel (+ optional AIKB extracts)."""

    def __init__(
        self,
        model: ArchitectureModel,
        knowledge: ProjectKnowledge | None = None,
        *,
        version: str | None = None,
    ) -> None:
        self.model = model
        self.knowledge = knowledge
        self.selector = ViewSelector()
        self.viz = VisualizationEngine(version=version)

    def architecture_flowchart(self) -> str:
        from generators.c4_generator import C4Generator

        return C4Generator(self.model, version=self.viz.version).container_mermaid()

    def domain_class_diagram(self) -> str:
        document = self.viz.compose(self.model, "domain")
        view = self.selector.domain_view(self.model)
        lines = [
            *mermaid_header(document),
            "classDiagram",
            "  %% Bounded contexts as packages",
        ]
        for ctx_name, entities in view.groups.items():
            lines.append(f'  namespace "{ctx_name}" {{')
            for entity in entities:
                eid = _sid(entity.name)
                stereotype = "Entity"
                if "aggregate-candidate" in entity.tags:
                    stereotype = "Aggregate"
                lines.append(f"    class {eid} <<{stereotype}>> {{")
                fields = (entity.metadata or {}).get("fields") or []
                for field_name in fields:
                    marker = "*" if field_name == "id" else ""
                    lines.append(f"      +{marker}{field_name}")
                lines.append("    }")
            lines.append("  }")

        for rel in view.relationships:
            src = rel.source_id.removeprefix("entity:")
            dst = rel.target_id.removeprefix("entity:")
            lines.append(f"  {_sid(src)} --> {_sid(dst)} : {rel.label or rel.rel_type}")

        for note in view.notes:
            lines.append(f"  %% {note}")
        if not view.elements:
            lines.append("  %% Información no disponible en AIKB: domain entities")
        return "\n".join(lines) + "\n"

    def database_er_diagram(self) -> str:
        view = self.selector.database_view(self.model)
        # Prefer curated AIKB ER but filter technical tables
        if self.knowledge:
            for key, body in self.knowledge.extracted_diagrams.items():
                if "erDiagram" not in body:
                    continue
                technical = {t.name for t in view.groups.get("technical_omitted") or []}
                if not technical:
                    return body if body.endswith("\n") else body + "\n"
                filtered_lines = ["erDiagram"]
                for line in body.splitlines():
                    stripped = line.strip()
                    if not stripped or stripped.startswith("erDiagram") or stripped.startswith("%%"):
                        continue
                    if any(name in stripped for name in technical):
                        continue
                    filtered_lines.append(f"  {stripped}" if not stripped.startswith(" ") else line)
                for note in view.notes:
                    filtered_lines.append(f"  %% {note}")
                return "\n".join(filtered_lines) + "\n"

        lines = ["erDiagram", f"  %% Database — {self.model.system_name}"]
        for table in view.elements:
            tid = _sid(table.name)
            lines.append(f"  {tid} {{")
            lines.append("    string id PK")
            lines.append("  }")
        for rel in view.relationships:
            left = rel.source_id.removeprefix("table:")
            right = rel.target_id.removeprefix("table:")
            lines.append(f"  {_sid(left)} }}o--|| {_sid(right)} : {rel.label or 'FK'}")
        for note in view.notes:
            lines.append(f"  %% {note}")
        return "\n".join(lines) + "\n"

    def dependencies_flowchart(self) -> str:
        lines = [
            "flowchart LR",
            f"  %% Architectural dependencies — {self.model.system_name}",
        ]
        if self.model.style:
            lines.append(f"  %% Style: {self.model.style}")

        # Tech facts
        for container in self.model.containers:
            lines.append(
                f'  {_sid(container.id)}["{container.name}\\n{container.technology or ""}"]'
            )
        for external in self.model.external_systems:
            lines.append(f'  {_sid(external.id)}(["{external.name}"])')

        view = self.selector.c4_container(self.model)
        for rel in view.relationships:
            if rel.source_id.startswith("actor:"):
                continue
            lines.append(
                f"  {_sid(rel.source_id)} -->|{rel.label or rel.rel_type}| {_sid(rel.target_id)}"
            )
        return "\n".join(lines) + "\n"

    def components_flowchart(self) -> str:
        view = self.selector.component_view(self.model)
        lines = [
            "flowchart TB",
            f"  %% Components by bounded context — {self.model.system_name}",
        ]
        for ctx_name, modules in view.groups.items():
            lines.append(f'  subgraph {_sid("ctx_"+ctx_name)}["{ctx_name}"]')
            for module in modules:
                label = module.name
                meta = module.metadata or {}
                if meta.get("controller"):
                    label += f"\\n{meta['controller']}"
                if module.responsibility and len(module.responsibility) < 50:
                    label += f"\\n{module.responsibility}"
                lines.append(f'    {_sid(module.id)}["{label}"]')
            lines.append("  end")

        db = next((c for c in self.model.containers if c.id == "container:db"), None)
        if db:
            lines.append(f'  {_sid(db.id)}[("{db.name}")]')
        for external in self.model.external_systems:
            lines.append(f'  {_sid(external.id)}{{{{"{external.name}"}}}}')

        for rel in view.relationships:
            if rel.source_id.startswith("service:"):
                continue
            lines.append(
                f"  {_sid(rel.source_id)} -->|{rel.label or rel.rel_type}| {_sid(rel.target_id)}"
            )
        return "\n".join(lines) + "\n"

    def sequence_diagram(self) -> str:
        if self.knowledge:
            preferred = (
                "diagram-sequence-auth",
                "diagram-sequence-ticket",
                "diagram-sequence-siigo",
            )
            for key in preferred:
                body = self.knowledge.extracted_diagrams.get(key)
                if body and "sequenceDiagram" in body:
                    return body if body.endswith("\n") else body + "\n"
            for key, body in self.knowledge.extracted_diagrams.items():
                if "sequenceDiagram" in body:
                    logger.info("Using extracted sequence diagram: %s", key)
                    return body if body.endswith("\n") else body + "\n"

        # Derive from architecture flow documented in ARCHITECTURE.md
        lines = [
            "sequenceDiagram",
            f"  %% Typical command flow — {self.model.system_name}",
            "  participant UI as Frontend SPA",
            "  participant CTRL as Controller (interfaces.rest)",
            "  participant SVC as Service / UseCase",
            "  participant PORT as Port Out",
            "  participant ADAPTER as Adapter",
            "  participant DB as MySQL",
            "  UI->>CTRL: HTTP REST",
            "  CTRL->>SVC: command",
            "  SVC->>PORT: persist / integrate",
            "  PORT->>ADAPTER: adapter call",
            "  ADAPTER->>DB: JDBC/JPA",
            "  ADAPTER-->>SVC: result",
            "  SVC-->>CTRL: domain/DTO",
            "  CTRL-->>UI: JSON response",
        ]
        return "\n".join(lines) + "\n"

    def generate(self, diagram_type: str) -> str:
        mapping = {
            "architecture": self.architecture_flowchart,
            "domain": self.domain_class_diagram,
            "database": self.database_er_diagram,
            "dependencies": self.dependencies_flowchart,
            "components": self.components_flowchart,
            "sequence": self.sequence_diagram,
            "c4-context": lambda: __import__(
                "generators.c4_generator", fromlist=["C4Generator"]
            ).C4Generator(self.model).context_mermaid(),
            "c4-container": lambda: __import__(
                "generators.c4_generator", fromlist=["C4Generator"]
            ).C4Generator(self.model).container_mermaid(),
        }
        generator = mapping.get(diagram_type)
        if generator is None:
            raise ValueError(f"Unsupported Mermaid diagram type: {diagram_type}")
        return generator()
