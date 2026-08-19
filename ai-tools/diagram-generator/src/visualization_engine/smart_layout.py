"""Smart layout with layer hierarchy and barycenter crossing reduction."""

from __future__ import annotations

from architecture_engine.models import ArchRelationship
from services.layout_service import Position
from visualization_engine.models import VisualGroup


class SmartLayoutEngine:
    """
    Hierarchical visual layout with reduced edge crossings.

    Strategy:
    1. Place groups as horizontal swimlanes (top → bottom)
    2. Order nodes within a lane by barycenter of neighbors in adjacent lanes
    3. Apply consistent gaps and padding for enterprise readability
    """

    def __init__(
        self,
        origin_x: float = 80.0,
        origin_y: float = 100.0,
        node_width: float = 210.0,
        node_height: float = 96.0,
        gap_x: float = 56.0,
        gap_y: float = 120.0,
        padding: float = 40.0,
        header: float = 36.0,
    ) -> None:
        self.origin_x = origin_x
        self.origin_y = origin_y
        self.node_width = node_width
        self.node_height = node_height
        self.gap_x = gap_x
        self.gap_y = gap_y
        self.padding = padding
        self.header = header

    def layout(
        self,
        groups: list[VisualGroup],
        relationships: list[ArchRelationship],
        *,
        node_width: float | None = None,
        node_height: float | None = None,
    ) -> tuple[dict[str, Position], dict[str, Position], float, float]:
        width = node_width or self.node_width
        height = node_height or self.node_height

        # Build adjacency for barycenter sort
        neighbors: dict[str, list[str]] = {}
        for relation in relationships:
            neighbors.setdefault(relation.source_id, []).append(relation.target_id)
            neighbors.setdefault(relation.target_id, []).append(relation.source_id)

        ordered_groups: list[tuple[VisualGroup, list[str]]] = []
        previous_order: list[str] = []
        for group in groups:
            ids = list(group.element_ids)
            if previous_order and ids:
                ids = self._barycenter_sort(ids, previous_order, neighbors)
            ordered_groups.append((group, ids))
            previous_order = ids

        positions: dict[str, Position] = {}
        group_boxes: dict[str, Position] = {}
        y = self.origin_y
        max_right = self.origin_x

        for group, ids in ordered_groups:
            if not ids:
                continue
            content_w = len(ids) * width + max(0, len(ids) - 1) * self.gap_x
            box_w = content_w + 2 * self.padding
            box_h = height + self.header + 2 * self.padding
            box_x = self.origin_x
            group_boxes[group.title] = Position(x=box_x, y=y, width=box_w, height=box_h)
            x = box_x + self.padding
            child_y = y + self.header + self.padding
            for node_id in ids:
                positions[node_id] = Position(
                    x=x, y=child_y, width=width, height=height
                )
                x += width + self.gap_x
            max_right = max(max_right, box_x + box_w)
            y += box_h + self.gap_y

        # Title strip reserved above origin_y
        canvas_w = max(1400.0, max_right + 120)
        canvas_h = max(1000.0, y + 140)
        return positions, group_boxes, canvas_w, canvas_h

    def layout_grid(
        self,
        element_ids: list[str],
        columns: int = 4,
        *,
        node_width: float = 200.0,
        node_height: float = 100.0,
    ) -> tuple[dict[str, Position], float, float]:
        positions: dict[str, Position] = {}
        for index, eid in enumerate(element_ids):
            col = index % columns
            row = index // columns
            positions[eid] = Position(
                x=self.origin_x + col * (node_width + self.gap_x),
                y=self.origin_y + row * (node_height + 48),
                width=node_width,
                height=node_height,
            )
        max_x = max((p.x + p.width for p in positions.values()), default=800)
        max_y = max((p.y + p.height for p in positions.values()), default=600)
        return positions, max(1200.0, max_x + 80), max(900.0, max_y + 120)

    def _barycenter_sort(
        self,
        lane: list[str],
        previous: list[str],
        neighbors: dict[str, list[str]],
    ) -> list[str]:
        index = {node: i for i, node in enumerate(previous)}

        def score(node: str) -> float:
            linked = [index[n] for n in neighbors.get(node, []) if n in index]
            if not linked:
                return float(lane.index(node))
            return sum(linked) / len(linked)

        return sorted(lane, key=score)
