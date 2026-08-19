"""Visual document model produced by the Visualization Intelligence Engine."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date

from architecture_engine.models import ArchElement, ArchRelationship
from services.layout_service import Position


@dataclass(slots=True)
class DiagramAnnotation:
    """Enterprise documentation chrome for a diagram."""

    title: str
    subtitle: str | None = None
    c4_level: str | None = None
    version: str | None = None
    generated_on: str = field(default_factory=lambda: date.today().isoformat())
    system_name: str | None = None
    technologies: list[str] = field(default_factory=list)
    legend: list[str] = field(default_factory=list)
    notes: list[str] = field(default_factory=list)
    responsibilities_summary: list[str] = field(default_factory=list)


@dataclass(slots=True)
class VisualGroup:
    """Named visual cluster (bounded context, layer, lane)."""

    id: str
    title: str
    kind: str  # bounded_context | layer | lane | system_boundary
    element_ids: list[str] = field(default_factory=list)


@dataclass(slots=True)
class VisualDocument:
    """ArchitectureModel slice ready for professional rendering."""

    view: str
    elements: list[ArchElement]
    relationships: list[ArchRelationship]
    groups: list[VisualGroup]
    annotation: DiagramAnnotation
    positions: dict[str, Position] = field(default_factory=dict)
    group_boxes: dict[str, Position] = field(default_factory=dict)
    canvas_width: float = 1400.0
    canvas_height: float = 1000.0
    filtered_out_relations: int = 0
    warnings: list[str] = field(default_factory=list)

    def element_map(self) -> dict[str, ArchElement]:
        return {element.id: element for element in self.elements}

    def groups_as_dict(self) -> dict[str, list[ArchElement]]:
        by_id = self.element_map()
        result: dict[str, list[ArchElement]] = {}
        for group in self.groups:
            result[group.title] = [
                by_id[eid] for eid in group.element_ids if eid in by_id
            ]
        return result
