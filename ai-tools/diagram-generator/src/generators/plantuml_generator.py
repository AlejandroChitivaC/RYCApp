"""PlantUML generator driven by ArchitectureModel."""

from __future__ import annotations

import re

from architecture_engine.models import ArchitectureModel
from architecture_engine.selectors import ViewSelector
from models.project import ProjectKnowledge


def _sid(value: str) -> str:
    cleaned = re.sub(r"[^A-Za-z0-9_]", "_", value)
    if cleaned and cleaned[0].isdigit():
        cleaned = f"N_{cleaned}"
    return cleaned or "node"


def _esc(text: str | None) -> str:
    return (text or "").replace('"', "'")


class PlantUMLGenerator:
    """Generate PlantUML diagrams from ArchitectureModel."""

    def __init__(
        self,
        model: ArchitectureModel,
        knowledge: ProjectKnowledge | None = None,
    ) -> None:
        self.model = model
        self.knowledge = knowledge
        self.selector = ViewSelector()

    def architecture(self) -> str:
        from generators.c4_generator import C4Generator

        return C4Generator(self.model).container()

    def components(self) -> str:
        from generators.c4_generator import C4Generator

        return C4Generator(self.model).component()

    def domain_class(self) -> str:
        view = self.selector.domain_view(self.model)
        lines = [
            "@startuml",
            f"title Domain Model (DDD) — {self.model.system_name}",
            "skinparam classAttributeIconSize 0",
            "skinparam packageStyle rectangle",
        ]
        for ctx_name, entities in view.groups.items():
            lines.append(f'package "{_esc(ctx_name)}" {{')
            for entity in entities:
                stereo = "<<Aggregate>>" if "aggregate-candidate" in entity.tags else "<<Entity>>"
                lines.append(f"  class {_sid(entity.name)} {stereo} {{")
                for field_name in (entity.metadata or {}).get("fields") or []:
                    prefix = "*" if field_name == "id" else ""
                    lines.append(f"    +{prefix}{field_name}")
                lines.append("  }")
            lines.append("}")
        for rel in view.relationships:
            src = rel.source_id.removeprefix("entity:")
            dst = rel.target_id.removeprefix("entity:")
            lines.append(
                f"{_sid(src)} --> {_sid(dst)} : {_esc(rel.label or rel.rel_type)}"
            )
        for note in view.notes:
            lines.append(f"note bottom\n  {_esc(note)}\nend note")
        lines.append("@enduml")
        return "\n".join(lines) + "\n"

    def sequence(self) -> str:
        lines = [
            "@startuml",
            f"title Sequence — Command flow — {self.model.system_name}",
            'actor "Frontend SPA" as UI',
            'participant "Controller\\n(interfaces.rest)" as CTRL',
            'participant "Service / UseCase\\n(application)" as SVC',
            'participant "Port Out" as PORT',
            'participant "Adapter\\n(infrastructure)" as ADAPTER',
            'database "MySQL" as DB',
            "UI -> CTRL: HTTP REST",
            "CTRL -> SVC: command",
            "SVC -> PORT: persist / integrate",
            "PORT -> ADAPTER: adapter call",
            "ADAPTER -> DB: JDBC / JPA",
            "ADAPTER --> SVC: result",
            "SVC --> CTRL: domain / DTO",
            "CTRL --> UI: JSON",
            "note right of SVC",
            "  Evidencia AIKB:",
            "  HTTP → Controller → UseCase/Service",
            "  → Port Out → Adapter → DB/API",
            "end note",
            "@enduml",
        ]
        return "\n".join(lines) + "\n"

    def database_er(self) -> str:
        view = self.selector.database_view(self.model)
        lines = [
            "@startuml",
            f"title ER Diagram — {self.model.system_name}",
            "hide circle",
            "skinparam linetype ortho",
        ]
        for table in view.elements:
            lines.append(f"entity {_sid(table.name)} {{")
            lines.append("  * id : PK")
            if table.responsibility:
                lines.append(f"  ..")
                lines.append(f"  {table.responsibility[:40]}")
            lines.append("}")
        for rel in view.relationships:
            left = rel.source_id.removeprefix("table:")
            right = rel.target_id.removeprefix("table:")
            lines.append(
                f"{_sid(left)} }}o--|| {_sid(right)} : {_esc(rel.label or 'FK')}"
            )
        for note in view.notes:
            lines.append(f"note bottom\n  {_esc(note)}\nend note")
        lines.append("@enduml")
        return "\n".join(lines) + "\n"

    def generate(self, diagram_type: str) -> str:
        mapping = {
            "architecture": self.architecture,
            "components": self.components,
            "domain": self.domain_class,
            "sequence": self.sequence,
            "database": self.database_er,
            "dependencies": self.architecture,
            "c4-context": lambda: __import__(
                "generators.c4_generator", fromlist=["C4Generator"]
            ).C4Generator(self.model).context(),
            "c4-container": self.architecture,
            "c4-component": self.components,
            "c4-code": lambda: __import__(
                "generators.c4_generator", fromlist=["C4Generator"]
            ).C4Generator(self.model).code(),
        }
        generator = mapping.get(diagram_type)
        if generator is None:
            raise ValueError(f"Unsupported PlantUML diagram type: {diagram_type}")
        return generator()
