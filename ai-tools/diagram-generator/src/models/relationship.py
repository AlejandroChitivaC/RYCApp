"""Relationship model."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(slots=True)
class Relationship:
    """A directed relationship between two knowledge nodes."""

    source: str
    target: str
    rel_type: str
    role: str | None = None
    layer: str | None = None

    @property
    def label(self) -> str:
        if self.role:
            return f"{self.rel_type} ({self.role})"
        return self.rel_type
