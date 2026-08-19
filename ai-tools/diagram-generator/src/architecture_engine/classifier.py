"""Evidence-driven architectural layer classification."""

from __future__ import annotations

import re

from architecture_engine.models import ArchLayer

# Keyword evidence → layer. Order matters: first match wins within a category.
INTERFACE_PATTERNS = (
    r"controller$",
    r"\bapi\b",
    r"endpoint",
    r"\bdto\b",
    r"interfaces\.rest",
    r"rest/",
)
APPLICATION_PATTERNS = (
    r"usecase$",
    r"use_case",
    r"service$",
    r"handler$",
    r"application\.service",
    r"ports\.in",
    r"application/",
)
DOMAIN_PATTERNS = (
    r"\bentity\b",
    r"aggregate",
    r"valueobject",
    r"value_object",
    r"domain\.model",
    r"domain/model",
)
INFRASTRUCTURE_PATTERNS = (
    r"repository$",
    r"\bdatabase\b",
    r"\borm\b",
    r"\bjpa\b",
    r"persistence",
    r"adapter$",
    r"infrastructure\.",
    r"infrastructure/",
)
PRESENTATION_PATTERNS = (
    r"frontend",
    r"\breact\b",
    r"\bpage\b",
    r"\bstore\b",
    r"feature",
)


class LayerClassifier:
    """Classify elements using naming/path evidence from the AIKB."""

    def classify(self, *evidence_parts: str | None) -> tuple[ArchLayer, list[str]]:
        blob = " ".join(part for part in evidence_parts if part).lower()
        if not blob:
            return ArchLayer.UNKNOWN, []

        checks: list[tuple[ArchLayer, tuple[str, ...]]] = [
            (ArchLayer.INTERFACE, INTERFACE_PATTERNS),
            (ArchLayer.APPLICATION, APPLICATION_PATTERNS),
            (ArchLayer.DOMAIN, DOMAIN_PATTERNS),
            (ArchLayer.INFRASTRUCTURE, INFRASTRUCTURE_PATTERNS),
            (ArchLayer.PRESENTATION, PRESENTATION_PATTERNS),
        ]
        matched: list[str] = []
        for layer, patterns in checks:
            for pattern in patterns:
                if re.search(pattern, blob, flags=re.IGNORECASE):
                    matched.append(pattern)
                    return layer, matched
        return ArchLayer.UNKNOWN, matched

    def classify_controller(self, name: str | None) -> ArchLayer:
        layer, _ = self.classify(name, "controller")
        return layer if layer != ArchLayer.UNKNOWN else ArchLayer.INTERFACE

    def classify_service(self, name: str | None) -> ArchLayer:
        layer, _ = self.classify(name, "service", "usecase")
        return layer if layer != ArchLayer.UNKNOWN else ArchLayer.APPLICATION

    def classify_repository(self, name: str | None) -> ArchLayer:
        layer, _ = self.classify(name, "repository", "persistence")
        return layer if layer != ArchLayer.UNKNOWN else ArchLayer.INFRASTRUCTURE

    def classify_entity(self, name: str | None, path: str | None = None) -> ArchLayer:
        layer, _ = self.classify(name, path, "entity", "domain.model")
        return layer if layer != ArchLayer.UNKNOWN else ArchLayer.DOMAIN
