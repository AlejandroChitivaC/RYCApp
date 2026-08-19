"""Pre-generation validation against the AIKB."""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from loaders.knowledge_graph_loader import KnowledgeGraphLoader
from loaders.metadata_loader import REQUIRED_METADATA_FILES, MetadataLoader
from models.project import ProjectKnowledge

logger = logging.getLogger(__name__)


@dataclass(slots=True)
class ValidationReport:
    """Result of validating an AIKB before diagram generation."""

    ok: bool
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)

    def raise_if_invalid(self) -> None:
        if not self.ok:
            joined = "; ".join(self.errors)
            raise ValueError(f"AIKB validation failed: {joined}")


class Validators:
    """Validate AIKB presence, JSON integrity and reference consistency."""

    def __init__(self, ai_brain: Path) -> None:
        self.ai_brain = ai_brain
        self.metadata_dir = ai_brain / "11_METADATA"
        self._kg = KnowledgeGraphLoader()

    def validate_structure(self) -> ValidationReport:
        errors: list[str] = []
        warnings: list[str] = []

        if not self.ai_brain.is_dir():
            errors.append(f"AIKB path does not exist: {self.ai_brain}")
            return ValidationReport(ok=False, errors=errors)

        if not self.metadata_dir.is_dir():
            errors.append(f"Metadata directory missing: {self.metadata_dir}")
            return ValidationReport(ok=False, errors=errors)

        for filename in REQUIRED_METADATA_FILES:
            path = self.metadata_dir / filename
            if not path.is_file():
                errors.append(f"Required JSON missing: {filename}")

        if errors:
            return ValidationReport(ok=False, errors=errors, warnings=warnings)

        loader = MetadataLoader(self.metadata_dir)
        try:
            payload = loader.load_all()
        except (FileNotFoundError, ValueError) as exc:
            errors.append(str(exc))
            return ValidationReport(ok=False, errors=errors, warnings=warnings)

        graph = payload.get("knowledge-graph.json") or {}
        nodes = graph.get("nodes") or []
        edges = graph.get("edges") or []
        if not nodes:
            warnings.append("Información no disponible en AIKB: knowledge graph nodes")
        edge_warnings = self._kg.validate_edge_refs(nodes, edges)
        for message in edge_warnings:
            warnings.append(f"Información no disponible en AIKB: {message}")

        entities = {
            str(item.get("id"))
            for item in (payload.get("entities.json") or {}).get("entities") or []
        }
        for relation in (payload.get("relationships.json") or {}).get("relationships") or []:
            source = str(relation.get("from") or "")
            target = str(relation.get("to") or "")
            if source and source not in entities:
                warnings.append(
                    f"Información no disponible en AIKB: relationship source {source}"
                )
            if target and target not in entities:
                warnings.append(
                    f"Información no disponible en AIKB: relationship target {target}"
                )

        logger.info(
            "AIKB validation complete: %s errors, %s warnings",
            len(errors),
            len(warnings),
        )
        return ValidationReport(ok=not errors, errors=errors, warnings=warnings)

    def validate_knowledge(self, knowledge: ProjectKnowledge) -> ValidationReport:
        warnings = list(knowledge.warnings)
        errors: list[str] = []
        if not knowledge.modules and not knowledge.entities:
            errors.append("No modules or entities found in AIKB metadata")
        if not knowledge.entities:
            warnings.append("Información no disponible en AIKB: entities")
        if not knowledge.relationships:
            warnings.append("Información no disponible en AIKB: relationships")
        if not knowledge.apis:
            warnings.append("Información no disponible en AIKB: APIs")
        return ValidationReport(ok=not errors, errors=errors, warnings=warnings)


def summarize_payload_keys(payload: dict[str, Any]) -> list[str]:
    return sorted(payload.keys())
