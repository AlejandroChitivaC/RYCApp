"""Graph helpers over ProjectKnowledge."""

from __future__ import annotations

from collections import defaultdict

from models.project import ProjectKnowledge
from models.relationship import Relationship


class GraphService:
    """Query and transform the knowledge graph for generators."""

    def __init__(self, knowledge: ProjectKnowledge) -> None:
        self.knowledge = knowledge

    def adjacency(self) -> dict[str, list[Relationship]]:
        graph: dict[str, list[Relationship]] = defaultdict(list)
        for relation in self.knowledge.relationships:
            graph[relation.source].append(relation)
        return dict(graph)

    def entity_ids(self) -> set[str]:
        return {entity.id for entity in self.knowledge.entities}

    def filter_entity_relationships(self) -> list[Relationship]:
        known = self.entity_ids()
        return [
            relation
            for relation in self.knowledge.relationships
            if relation.source in known and relation.target in known
        ]

    def module_dependency_pairs(self) -> list[tuple[str, str, str]]:
        """
        Derive module dependency edges only when both ends are known modules.

        Uses controllers/entity proximity from relationships when available;
        otherwise returns empty (no invented edges).
        """
        module_ids = {module.id for module in self.knowledge.modules}
        pairs: list[tuple[str, str, str]] = []

        # Knowledge-graph edges between module:* nodes only
        for edge in self.knowledge.graph_edges:
            source = str(edge.get("from") or "")
            target = str(edge.get("to") or "")
            rel_type = str(edge.get("type") or "depends")
            if source.startswith("module:") and target.startswith("module:"):
                left = source.removeprefix("module:")
                right = target.removeprefix("module:")
                if left in module_ids and right in module_ids:
                    pairs.append((left, right, rel_type))
        return pairs

    def nodes_by_type(self, node_type: str) -> list[dict]:
        return [
            node
            for node in self.knowledge.graph_nodes
            if str(node.get("type")) == node_type
        ]
