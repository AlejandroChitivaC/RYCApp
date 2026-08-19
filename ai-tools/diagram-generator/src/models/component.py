"""Component / container model for C4-style diagrams."""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(slots=True)
class Component:
    """A logical component inferred only from AIKB facts."""

    id: str
    name: str
    kind: str  # person | system | container | component | external
    description: str | None = None
    technology: str | None = None
    parent_id: str | None = None
    tags: list[str] = field(default_factory=list)
