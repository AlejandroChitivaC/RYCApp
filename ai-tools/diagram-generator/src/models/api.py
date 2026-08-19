"""API endpoint model."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(slots=True)
class APIEndpoint:
    """A REST endpoint declared in the AIKB."""

    method: str
    path: str
    auth: str | None = None
    controller: str | None = None

    @property
    def label(self) -> str:
        return f"{self.method} {self.path}"

    @property
    def resource_group(self) -> str:
        """Best-effort group from path segments; never invents names."""
        parts = [p for p in self.path.split("/") if p and p != "api"]
        return parts[0] if parts else "root"
