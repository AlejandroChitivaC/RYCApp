"""View selectors — intelligence filters for diagram generation."""

from __future__ import annotations

from dataclasses import dataclass

from architecture_engine.models import (
    ArchElement,
    ArchLevel,
    ArchRelationship,
    ArchitectureModel,
)


@dataclass(slots=True)
class ViewSelection:
    """Filtered slice of the architecture model for one diagram view."""

    name: str
    elements: list[ArchElement]
    relationships: list[ArchRelationship]
    groups: dict[str, list[ArchElement]]
    notes: list[str]


class ViewSelector:
    """Select only relevant elements per architectural view."""

    def architecture_view(self, model: ArchitectureModel) -> ViewSelection:
        elements = [
            *model.actors,
            *model.systems,
            *model.containers,
            *model.external_systems,
        ]
        ids = {e.id for e in elements}
        rels = [
            r
            for r in model.relationships
            if r.architectural_level in {ArchLevel.CONTEXT, ArchLevel.CONTAINER}
            and r.source_id in ids
            and r.target_id in ids
        ]
        return ViewSelection(
            name="architecture",
            elements=elements,
            relationships=rels,
            groups={
                "actors": list(model.actors),
                "system": list(model.systems),
                "containers": list(model.containers),
                "externals": list(model.external_systems),
            },
            notes=list(model.notes),
        )

    def c4_context(self, model: ArchitectureModel) -> ViewSelection:
        elements = [*model.actors, *model.systems, *model.external_systems]
        ids = {e.id for e in elements}
        rels = [
            r
            for r in model.relationships
            if r.architectural_level == ArchLevel.CONTEXT
            and r.source_id in ids
            and r.target_id in ids
        ]
        return ViewSelection(
            name="c4-context",
            elements=elements,
            relationships=rels,
            groups={
                "actors": list(model.actors),
                "system": list(model.systems),
                "externals": list(model.external_systems),
            },
            notes=["C4 Level 1 — System Context: sin clases ni módulos"],
        )

    def c4_container(self, model: ArchitectureModel) -> ViewSelection:
        elements = [
            *model.actors,
            *model.containers,
            *model.external_systems,
        ]
        ids = {e.id for e in elements}
        rels = [
            r
            for r in model.relationships
            if r.architectural_level == ArchLevel.CONTAINER
            and r.source_id in ids
            and r.target_id in ids
        ]
        return ViewSelection(
            name="c4-container",
            elements=elements,
            relationships=rels,
            groups={
                "actors": list(model.actors),
                "containers": list(model.containers),
                "externals": list(model.external_systems),
            },
            notes=["C4 Level 2 — Containers con tecnología y responsabilidad"],
        )

    def component_view(self, model: ArchitectureModel) -> ViewSelection:
        modules = [m for m in model.modules if m.parent_id == "container:api"]
        services = list(model.services)
        elements: list[ArchElement] = [*modules, *services]
        ids = {e.id for e in elements} | {"container:db"} | {
            e.id for e in model.external_systems
        }
        elements = [
            *elements,
            *model.external_systems,
            *[c for c in model.containers if c.id == "container:db"],
        ]
        rels = [
            r
            for r in model.relationships
            if r.architectural_level == ArchLevel.COMPONENT
            and r.source_id in ids
            and r.target_id in ids
        ]
        groups: dict[str, list[ArchElement]] = {}
        for module in modules:
            key = module.bounded_context or "other"
            groups.setdefault(key, []).append(module)
        return ViewSelection(
            name="components",
            elements=elements,
            relationships=rels,
            groups=groups,
            notes=["C4 Level 3 — Componentes por bounded context"],
        )

    def code_view(self, model: ArchitectureModel) -> ViewSelection:
        elements = [
            *[c for c in model.components if c.architectural_level == ArchLevel.CODE],
            *model.services,
            *model.repositories,
            *[
                c
                for c in model.components
                if "controller" in c.tags or "usecase" in c.tags
            ],
        ]
        seen: set[str] = set()
        unique: list[ArchElement] = []
        for element in elements:
            if element.id in seen:
                continue
            seen.add(element.id)
            unique.append(element)
        ids = {e.id for e in unique}
        rels = [
            r
            for r in model.relationships
            if r.source_id in ids and r.target_id in ids
        ]
        groups = {
            "interface": [e for e in unique if e.layer.value == "interface"],
            "application": [e for e in unique if e.layer.value == "application"],
            "infrastructure": [e for e in unique if e.layer.value == "infrastructure"],
        }
        return ViewSelection(
            name="code",
            elements=unique,
            relationships=rels,
            groups=groups,
            notes=["C4 Level 4 — Code Diagram (solo bajo demanda)"],
        )

    def domain_view(self, model: ArchitectureModel) -> ViewSelection:
        relevant = list(model.domain_entities)
        ids = {e.id for e in relevant}
        rels = [
            r
            for r in model.relationships
            if r.architectural_level == ArchLevel.DOMAIN
            and r.source_id in ids
            and r.target_id in ids
        ]
        groups: dict[str, list[ArchElement]] = {}
        for entity in relevant:
            key = entity.bounded_context or entity.metadata.get("category") or "domain"
            groups.setdefault(str(key), []).append(entity)
        notes = list(model.notes)
        notes.append(
            "DDD: dominio anémico (records); sin aggregates ricos ni domain events (AIKB)"
        )
        return ViewSelection(
            name="domain",
            elements=relevant,
            relationships=rels,
            groups=groups,
            notes=notes,
        )

    def database_view(self, model: ArchitectureModel) -> ViewSelection:
        primary = [t for t in model.database_entities if "technical" not in t.tags]
        technical = [t for t in model.database_entities if "technical" in t.tags]
        ids = {t.id for t in primary}
        rels = [
            r
            for r in model.relationships
            if r.architectural_level == ArchLevel.DATA
            and r.source_id in ids
            and r.target_id in ids
        ]
        notes = [
            "Tablas técnicas omitidas del diagrama principal: "
            + (", ".join(t.name for t in technical) if technical else "(ninguna)")
        ]
        return ViewSelection(
            name="database",
            elements=primary,
            relationships=rels,
            groups={"tables": primary, "technical_omitted": technical},
            notes=notes,
        )

    def select(self, model: ArchitectureModel, view: str) -> ViewSelection:
        mapping = {
            "architecture": self.architecture_view,
            "full-architecture": self.architecture_view,
            "c4-context": self.c4_context,
            "c4-container": self.c4_container,
            "components": self.component_view,
            "c4-component": self.component_view,
            "code": self.code_view,
            "c4-code": self.code_view,
            "domain": self.domain_view,
            "database": self.database_view,
        }
        handler = mapping.get(view)
        if handler is None:
            raise ValueError(f"Unknown architecture view: {view}")
        return handler(model)
