"""Domain entity model."""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(slots=True)
class Entity:
    """A domain entity declared in the AIKB."""

    id: str
    path: str | None = None
    fields: list[str] = field(default_factory=list)
    layer: str | None = None

    @property
    def label(self) -> str:
        return self.id
