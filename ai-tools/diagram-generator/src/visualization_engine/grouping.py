"""Visual grouping by bounded context and architectural layers."""

from __future__ import annotations

from architecture_engine.models import ArchElement, ArchLayer, ElementKind
from visualization_engine.models import VisualGroup

LAYER_ORDER = [
    ArchLayer.PRESENTATION,
    ArchLayer.INTERFACE,
    ArchLayer.APPLICATION,
    ArchLayer.DOMAIN,
    ArchLayer.INFRASTRUCTURE,
    ArchLayer.EXTERNAL,
    ArchLayer.UNKNOWN,
]


class VisualGrouping:
    """Build hierarchical groups for enterprise diagrams."""

    def by_bounded_context(self, elements: list[ArchElement]) -> list[VisualGroup]:
        buckets: dict[str, list[ArchElement]] = {}
        for element in elements:
            key = element.bounded_context or "shared"
            buckets.setdefault(key, []).append(element)
        return [
            VisualGroup(
                id=f"bc:{ctx}",
                title=ctx,
                kind="bounded_context",
                element_ids=[e.id for e in items],
            )
            for ctx, items in sorted(buckets.items())
        ]

    def by_layer(self, elements: list[ArchElement]) -> list[VisualGroup]:
        buckets: dict[ArchLayer, list[ArchElement]] = {layer: [] for layer in LAYER_ORDER}
        for element in elements:
            buckets.setdefault(element.layer, []).append(element)
        groups: list[VisualGroup] = []
        for layer in LAYER_ORDER:
            items = buckets.get(layer) or []
            if not items:
                continue
            groups.append(
                VisualGroup(
                    id=f"layer:{layer.value}",
                    title=layer.value,
                    kind="layer",
                    element_ids=[e.id for e in items],
                )
            )
        return groups

    def by_c4_lanes(self, view: str, elements: list[ArchElement]) -> list[VisualGroup]:
        if view == "c4-context":
            order = [
                ("actors", ElementKind.ACTOR),
                ("system", ElementKind.SYSTEM),
                ("externals", ElementKind.EXTERNAL_SYSTEM),
            ]
            return self._lanes(order, elements)

        if view in {"c4-container", "architecture"}:
            return self._lanes(
                [
                    ("actors", ElementKind.ACTOR),
                    ("containers", ElementKind.CONTAINER),
                    ("externals", ElementKind.EXTERNAL_SYSTEM),
                ],
                elements,
            )

        if view in {"c4-component", "components"}:
            return self.by_bounded_context(
                [e for e in elements if e.kind == ElementKind.MODULE]
            )

        if view in {"c4-code", "code"}:
            return self.by_layer(elements)

        if view == "domain":
            return self.by_bounded_context(elements)

        if view == "database":
            return [
                VisualGroup(
                    id="lane:tables",
                    title="tables",
                    kind="lane",
                    element_ids=[e.id for e in elements],
                )
            ]

        return [
            VisualGroup(
                id="lane:all",
                title="elements",
                kind="lane",
                element_ids=[e.id for e in elements],
            )
        ]

    def _lanes(
        self,
        order: list[tuple[str, ElementKind]],
        elements: list[ArchElement],
    ) -> list[VisualGroup]:
        groups: list[VisualGroup] = []
        for title, kind in order:
            ids = [e.id for e in elements if e.kind == kind]
            if ids:
                groups.append(
                    VisualGroup(
                        id=f"lane:{title}",
                        title=title,
                        kind="lane",
                        element_ids=ids,
                    )
                )
        return groups
