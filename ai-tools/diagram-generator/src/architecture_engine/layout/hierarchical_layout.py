"""Hierarchical layout engine — layered placement without crossing-prone grids."""

from __future__ import annotations

from dataclasses import dataclass

from architecture_engine.selectors import ViewSelection
from services.layout_service import Position


@dataclass(slots=True)
class LayoutResult:
    positions: dict[str, Position]
    group_boxes: dict[str, Position]
    canvas_width: float
    canvas_height: float


class HierarchicalLayoutEngine:
    """
    Place nodes by explicit architectural layers / groups.

    Strategy:
    - Vertical lanes by layer/group (top → bottom)
    - Horizontal distribution within each lane
    - Group boxes (swimlanes) sized to enclose children with padding
    """

    def __init__(
        self,
        origin_x: float = 60.0,
        origin_y: float = 60.0,
        node_width: float = 200.0,
        node_height: float = 90.0,
        gap_x: float = 48.0,
        gap_y: float = 110.0,
        group_padding: float = 36.0,
        header: float = 36.0,
    ) -> None:
        self.origin_x = origin_x
        self.origin_y = origin_y
        self.node_width = node_width
        self.node_height = node_height
        self.gap_x = gap_x
        self.gap_y = gap_y
        self.group_padding = group_padding
        self.header = header

    def layout_layers(
        self,
        layers: list[tuple[str, list[str]]],
        *,
        node_width: float | None = None,
        node_height: float | None = None,
    ) -> LayoutResult:
        width = node_width or self.node_width
        height = node_height or self.node_height
        positions: dict[str, Position] = {}
        group_boxes: dict[str, Position] = {}
        y = self.origin_y
        max_right = self.origin_x

        for group_name, node_ids in layers:
            if not node_ids:
                continue
            count = len(node_ids)
            content_width = count * width + max(0, count - 1) * self.gap_x
            box_width = content_width + 2 * self.group_padding
            box_height = height + self.header + 2 * self.group_padding
            box_x = self.origin_x
            group_boxes[group_name] = Position(
                x=box_x,
                y=y,
                width=box_width,
                height=box_height,
            )
            x = box_x + self.group_padding
            child_y = y + self.header + self.group_padding
            for node_id in node_ids:
                positions[node_id] = Position(
                    x=x,
                    y=child_y,
                    width=width,
                    height=height,
                )
                x += width + self.gap_x
            max_right = max(max_right, box_x + box_width)
            y += box_height + self.gap_y

        return LayoutResult(
            positions=positions,
            group_boxes=group_boxes,
            canvas_width=max(1200.0, max_right + 80),
            canvas_height=max(900.0, y + 80),
        )

    def layout_view(
        self,
        selection: ViewSelection,
        preferred_order: list[str] | None = None,
    ) -> LayoutResult:
        order = preferred_order or list(selection.groups.keys())
        layers: list[tuple[str, list[str]]] = []
        seen: set[str] = set()
        for key in order:
            elements = selection.groups.get(key) or []
            ids = [e.id for e in elements]
            for eid in ids:
                seen.add(eid)
            if ids:
                layers.append((key, ids))
        leftovers = [e.id for e in selection.elements if e.id not in seen]
        if leftovers:
            layers.append(("other", leftovers))
        return self.layout_layers(layers)

    def layout_context(self, selection: ViewSelection) -> LayoutResult:
        return self.layout_view(
            selection,
            preferred_order=["actors", "system", "externals"],
        )

    def layout_containers(self, selection: ViewSelection) -> LayoutResult:
        return self.layout_view(
            selection,
            preferred_order=["actors", "containers", "externals"],
        )

    def layout_domain(self, selection: ViewSelection) -> LayoutResult:
        # Place by bounded context; widen nodes for field details
        return self.layout_layers(
            [
                (name, [e.id for e in elements])
                for name, elements in selection.groups.items()
            ],
            node_width=220,
            node_height=100,
        )

    def layout_database(self, selection: ViewSelection) -> LayoutResult:
        tables = selection.groups.get("tables") or selection.elements
        # Single lane with wrapping columns for ER clarity
        columns = 4
        positions: dict[str, Position] = {}
        for index, table in enumerate(tables):
            col = index % columns
            row = index // columns
            positions[table.id] = Position(
                x=self.origin_x + col * (200 + self.gap_x),
                y=self.origin_y + row * (110 + 40),
                width=200,
                height=100,
            )
        max_x = max((p.x + p.width for p in positions.values()), default=800)
        max_y = max((p.y + p.height for p in positions.values()), default=600)
        return LayoutResult(
            positions=positions,
            group_boxes={},
            canvas_width=max(1200.0, max_x + 80),
            canvas_height=max(900.0, max_y + 80),
        )
