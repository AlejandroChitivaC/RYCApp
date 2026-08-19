"""Visualization Intelligence Engine — ArchitectureModel → VisualDocument."""

from __future__ import annotations

import logging

from architecture_engine.models import ArchitectureModel, ElementKind
from architecture_engine.selectors import ViewSelector
from visualization_engine.annotations import AnnotationBuilder
from visualization_engine.c4_rules import C4Rules
from visualization_engine.grouping import VisualGrouping
from visualization_engine.models import VisualDocument, VisualGroup
from visualization_engine.relation_filter import RelationFilter
from visualization_engine.smart_layout import SmartLayoutEngine

logger = logging.getLogger(__name__)


class VisualizationEngine:
    """
    Transform ArchitectureModel into enterprise-grade visual documents.

    Applies C4 purity, grouping, relation pruning, smart layout and annotations.
    """

    def __init__(self, version: str | None = None) -> None:
        self.version = version
        self.selector = ViewSelector()
        self.c4 = C4Rules()
        self.grouping = VisualGrouping()
        self.relations = RelationFilter()
        self.layout = SmartLayoutEngine()
        self.annotations = AnnotationBuilder()

    def compose(self, model: ArchitectureModel, view: str) -> VisualDocument:
        # Start from semantic selector, then harden with visualization rules
        try:
            selection = self.selector.select(model, view)
            base_elements = list(selection.elements)
            base_relationships = list(selection.relationships)
            base_notes = list(selection.notes)
        except ValueError:
            base_elements = []
            base_relationships = []
            base_notes = []

        elements = self.c4.filter_elements(view, base_elements)
        purity_warnings = self.c4.validate_purity(view, elements)

        # External + DB targets for component views
        if view in {"c4-component", "components"}:
            extra = [
                e
                for e in model.external_systems
                if e.id not in {x.id for x in elements}
            ]
            db = next((c for c in model.containers if c.id == "container:db"), None)
            if db and db.id not in {x.id for x in elements}:
                extra.append(db)
            elements.extend(extra)

        element_ids = {e.id for e in elements}
        kinds = {e.id: e.kind for e in elements}
        relationships, dropped = self.relations.filter(
            view,
            base_relationships + [
                r
                for r in model.relationships
                if r.id not in {x.id for x in base_relationships}
            ],
            element_ids,
            element_kinds=kinds,
        )

        groups = self._build_groups(view, elements)
        # Ensure every element appears in some group
        grouped_ids = {eid for g in groups for eid in g.element_ids}
        orphans = [e.id for e in elements if e.id not in grouped_ids]
        if orphans:
            groups.append(
                VisualGroup(
                    id="lane:other",
                    title="other",
                    kind="lane",
                    element_ids=orphans,
                )
            )

        if view == "database":
            positions, canvas_w, canvas_h = self.layout.layout_grid(
                [e.id for e in elements],
                columns=4,
            )
            group_boxes = {}
        else:
            nw = 220 if view == "domain" else None
            nh = 100 if view == "domain" else None
            positions, group_boxes, canvas_w, canvas_h = self.layout.layout(
                groups,
                relationships,
                node_width=nw,
                node_height=nh,
            )

        annotation = self.annotations.build(model, view)
        annotation.version = self.version or annotation.version
        annotation.notes = list(dict.fromkeys(annotation.notes + base_notes))

        document = VisualDocument(
            view=view,
            elements=elements,
            relationships=relationships,
            groups=groups,
            annotation=annotation,
            positions=positions,
            group_boxes=group_boxes,
            canvas_width=canvas_w,
            canvas_height=canvas_h,
            filtered_out_relations=dropped,
            warnings=purity_warnings,
        )
        logger.info(
            "VisualDocument[%s]: %s elements, %s rels (%s filtered), %s groups",
            view,
            len(elements),
            len(relationships),
            dropped,
            len(groups),
        )
        return document

    def _build_groups(self, view: str, elements: list[ArchElement]) -> list[VisualGroup]:
        if view in {"c4-component", "components"}:
            modules = [e for e in elements if e.kind == ElementKind.MODULE]
            groups = self.grouping.by_bounded_context(modules)
            extras = [
                e
                for e in elements
                if e.kind in {ElementKind.EXTERNAL_SYSTEM, ElementKind.CONTAINER}
            ]
            if extras:
                groups.append(
                    VisualGroup(
                        id="lane:dependencies",
                        title="dependencies",
                        kind="lane",
                        element_ids=[e.id for e in extras],
                    )
                )
            return groups
        return self.grouping.by_c4_lanes(view, elements)
