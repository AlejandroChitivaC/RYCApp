"""Architecture quality validation before diagram emission."""

from __future__ import annotations

import logging
from collections import defaultdict
from dataclasses import dataclass, field

from architecture_engine.models import ArchLayer, ArchitectureModel

logger = logging.getLogger(__name__)


@dataclass(slots=True)
class ArchitectureValidationReport:
    ok: bool
    warnings: list[str] = field(default_factory=list)
    errors: list[str] = field(default_factory=list)

    def log_all(self) -> None:
        for warning in self.warnings:
            logger.warning(warning)
        for error in self.errors:
            logger.error(error)


class ArchitectureValidator:
    """Validate ArchitectureModel quality without inventing fixes."""

    def validate(self, model: ArchitectureModel) -> ArchitectureValidationReport:
        warnings: list[str] = []
        errors: list[str] = []

        for element in [*model.modules, *model.components, *model.services]:
            if not element.responsibility:
                warnings.append(
                    "Información no disponible en AIKB: "
                    f"responsabilidad de {element.kind.value} '{element.name}'"
                )

        for element in [
            *model.modules,
            *model.components,
            *model.services,
            *model.repositories,
            *model.domain_entities,
        ]:
            if element.layer == ArchLayer.UNKNOWN:
                warnings.append(
                    "Información no disponible en AIKB: "
                    f"clasificación de capa para '{element.name}'"
                )

        known_ids: set[str] = set()
        for collection in (
            model.actors,
            model.systems,
            model.containers,
            model.external_systems,
            model.components,
            model.modules,
            model.services,
            model.repositories,
            model.domain_entities,
            model.database_entities,
        ):
            known_ids.update(e.id for e in collection)

        for relation in model.relationships:
            if relation.source_id not in known_ids:
                warnings.append(
                    "Información no disponible en AIKB: "
                    f"relación huérfana source={relation.source_id}"
                )
            if relation.target_id not in known_ids:
                warnings.append(
                    "Información no disponible en AIKB: "
                    f"relación huérfana target={relation.target_id}"
                )

        graph: dict[str, list[str]] = defaultdict(list)
        for relation in model.relationships:
            if relation.rel_type in {"depends", "calls", "persists", "integrates"}:
                graph[relation.source_id].append(relation.target_id)

        for cycle in self._find_cycles(graph):
            warnings.append(f"Dependencia circular detectada: {' → '.join(cycle)}")

        if not model.containers:
            errors.append("ArchitectureModel sin containers")
        if not model.systems:
            errors.append("ArchitectureModel sin system")

        report = ArchitectureValidationReport(
            ok=not errors,
            warnings=warnings,
            errors=errors,
        )
        report.log_all()
        return report

    def _find_cycles(self, graph: dict[str, list[str]]) -> list[list[str]]:
        visited: set[str] = set()
        stack: set[str] = set()
        path: list[str] = []
        cycles: list[list[str]] = []

        def dfs(node: str) -> None:
            visited.add(node)
            stack.add(node)
            path.append(node)
            for nxt in graph.get(node, []):
                if nxt not in visited:
                    dfs(nxt)
                elif nxt in stack and nxt in path:
                    idx = path.index(nxt)
                    cycles.append(path[idx:] + [nxt])
            path.pop()
            stack.remove(node)

        for node in list(graph.keys()):
            if node not in visited:
                dfs(node)
        return cycles
