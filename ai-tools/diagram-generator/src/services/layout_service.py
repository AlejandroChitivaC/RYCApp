"""Simple deterministic layout helpers for Draw.io diagrams."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(slots=True)
class Position:
    x: float
    y: float
    width: float
    height: float


class LayoutService:
    """Compute grid layouts without inventing domain structure."""

    def __init__(
        self,
        origin_x: float = 40.0,
        origin_y: float = 40.0,
        cell_width: float = 180.0,
        cell_height: float = 80.0,
        gap_x: float = 40.0,
        gap_y: float = 40.0,
        columns: int = 4,
    ) -> None:
        self.origin_x = origin_x
        self.origin_y = origin_y
        self.cell_width = cell_width
        self.cell_height = cell_height
        self.gap_x = gap_x
        self.gap_y = gap_y
        self.columns = max(1, columns)

    def grid(self, count: int) -> list[Position]:
        positions: list[Position] = []
        for index in range(count):
            column = index % self.columns
            row = index // self.columns
            x = self.origin_x + column * (self.cell_width + self.gap_x)
            y = self.origin_y + row * (self.cell_height + self.gap_y)
            positions.append(
                Position(
                    x=x,
                    y=y,
                    width=self.cell_width,
                    height=self.cell_height,
                )
            )
        return positions

    def layered(
        self,
        layers: list[list[str]],
        node_width: float = 160.0,
        node_height: float = 60.0,
        layer_gap: float = 120.0,
        node_gap: float = 30.0,
    ) -> dict[str, Position]:
        """Place nodes by explicit layers provided by the caller."""
        result: dict[str, Position] = {}
        y = self.origin_y
        for layer in layers:
            total_width = len(layer) * node_width + max(0, len(layer) - 1) * node_gap
            x = self.origin_x
            # Center each layer horizontally around a stable left origin
            if total_width > 0:
                x = self.origin_x
            for name in layer:
                result[name] = Position(x=x, y=y, width=node_width, height=node_height)
                x += node_width + node_gap
            y += node_height + layer_gap
        return result
