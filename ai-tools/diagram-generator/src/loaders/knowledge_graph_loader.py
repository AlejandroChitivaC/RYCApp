"""Knowledge graph loader."""

from __future__ import annotations

import logging
from typing import Any

logger = logging.getLogger(__name__)


class KnowledgeGraphLoader:
    """Normalize knowledge-graph.json into nodes and edges."""

    def load(self, data: dict[str, Any]) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
        nodes = list(data.get("nodes") or [])
        edges = list(data.get("edges") or [])
        logger.info(
            "Knowledge graph loaded: %s nodes, %s edges",
            len(nodes),
            len(edges),
        )
        return nodes, edges

    def nodes_by_type(self, nodes: list[dict[str, Any]]) -> dict[str, list[dict[str, Any]]]:
        grouped: dict[str, list[dict[str, Any]]] = {}
        for node in nodes:
            node_type = str(node.get("type") or "unknown")
            grouped.setdefault(node_type, []).append(node)
        return grouped

    def validate_edge_refs(
        self,
        nodes: list[dict[str, Any]],
        edges: list[dict[str, Any]],
    ) -> list[str]:
        """Return warnings for edges that reference missing nodes."""
        node_ids = {str(node.get("id")) for node in nodes if node.get("id")}
        warnings: list[str] = []
        for edge in edges:
            source = str(edge.get("from") or "")
            target = str(edge.get("to") or "")
            if source and source not in node_ids:
                warnings.append(f"edge source missing: {source}")
            if target and target not in node_ids:
                warnings.append(f"edge target missing: {target}")
        return warnings
