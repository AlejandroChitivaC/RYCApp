"""Circular dependency analyzer."""

from __future__ import annotations

from collections import defaultdict

from architecture_engine.analyzers.models import Finding, Severity
from architecture_engine.models import ArchitectureModel


class CircularDependencyAnalyzer:
    """Find cycles in the architectural dependency graph."""

    def analyze(self, model: ArchitectureModel) -> list[Finding]:
        graph: dict[str, list[str]] = defaultdict(list)
        for relation in model.relationships:
            if relation.rel_type not in {
                "depends",
                "calls",
                "persists",
                "integrates",
                "fk",
                "many-to-one",
                "one-to-one",
                "optional-one-to-one",
                "uses",
            }:
                # still include structural depends/calls
                pass
            # Focus on module and service wiring + domain cycles
            if relation.rel_type in {"depends", "calls"} or (
                relation.architectural_level.value == "domain"
                and relation.rel_type.endswith("to-one")
            ):
                graph[relation.source_id].append(relation.target_id)

        # Also module→module from component edges
        for relation in model.relationships:
            if relation.source_id.startswith("module:") and relation.target_id.startswith(
                "module:"
            ):
                graph[relation.source_id].append(relation.target_id)

        cycles = self._find_cycles(graph)
        findings: list[Finding] = []
        for index, cycle in enumerate(cycles):
            pretty = " → ".join(self._short(n) for n in cycle)
            findings.append(
                Finding(
                    id=f"CYC-{index+1}",
                    analyzer="circular",
                    severity=Severity.HIGH,
                    title=f"Dependencia circular: {pretty}",
                    detail=f"Ciclo detectado en el grafo arquitectónico: {pretty}",
                    evidence=["ArchitectureModel relationships"],
                    recommendation=(
                        "Romper el ciclo con inversión de dependencias, eventos "
                        "de dominio o un shared kernel explícito."
                    ),
                    metadata={"cycle": cycle},
                )
            )
        return findings

    def _short(self, node_id: str) -> str:
        for prefix in (
            "module:",
            "service:",
            "component:",
            "entity:",
            "repo:",
            "external:",
            "container:",
        ):
            if node_id.startswith(prefix):
                return node_id.removeprefix(prefix)
        return node_id

    def _find_cycles(self, graph: dict[str, list[str]]) -> list[list[str]]:
        visited: set[str] = set()
        stack: set[str] = set()
        path: list[str] = []
        cycles: list[list[str]] = []
        seen_cycle_keys: set[tuple[str, ...]] = set()

        def dfs(node: str) -> None:
            visited.add(node)
            stack.add(node)
            path.append(node)
            for nxt in graph.get(node, []):
                if nxt not in visited:
                    dfs(nxt)
                elif nxt in stack and nxt in path:
                    idx = path.index(nxt)
                    cycle = path[idx:] + [nxt]
                    key = tuple(sorted(cycle[:-1]))
                    if key not in seen_cycle_keys:
                        seen_cycle_keys.add(key)
                        cycles.append(cycle)
            path.pop()
            stack.remove(node)

        for node in list(graph.keys()):
            if node not in visited:
                dfs(node)
        return cycles
