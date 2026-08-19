"""Module model."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(slots=True)
class Module:
    """A functional module declared in the AIKB."""

    id: str
    backend_doc: str | None = None
    frontend: str | None = None
    controller: str | None = None
    note: str | None = None

    @property
    def label(self) -> str:
        return self.id

    @property
    def has_backend(self) -> bool:
        return bool(self.backend_doc)

    @property
    def has_frontend(self) -> bool:
        return bool(self.frontend)
