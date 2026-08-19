"""Filter irrelevant relationships for a visual view."""

from __future__ import annotations

from architecture_engine.models import ArchRelationship, ElementKind

# Relation types considered noise for certain views
NOISE_REL_TYPES = {"persists"}  # many module→db edges clutter component views


class RelationFilter:
    """Eliminate cross-level and low-value edges from a VisualDocument."""

    def filter(
        self,
        view: str,
        relationships: list[ArchRelationship],
        element_ids: set[str],
        *,
        element_kinds: dict[str, ElementKind] | None = None,
    ) -> tuple[list[ArchRelationship], int]:
        kept: list[ArchRelationship] = []
        dropped = 0
        kinds = element_kinds or {}

        for relation in relationships:
            if relation.source_id not in element_ids or relation.target_id not in element_ids:
                dropped += 1
                continue

            # Never keep cross-level mix that survived element filter poorly
            if view == "c4-context" and relation.architectural_level.value not in {
                "context",
            }:
                # allow only context-level edges
                if relation.architectural_level.value != "context":
                    dropped += 1
                    continue

            if view in {"c4-container", "architecture"}:
                if relation.architectural_level.value not in {"container", "context"}:
                    dropped += 1
                    continue
                # Drop actor→system when we already show actor→spa
                if relation.target_id.startswith("system:") and view == "c4-container":
                    dropped += 1
                    continue

            if view in {"c4-component", "components"}:
                # Drop service-level wiring when we show module packing (reduces crossings)
                if relation.source_id.startswith("service:"):
                    dropped += 1
                    continue
                # Keep at most one edge type to DB per source — handled later by dedupe
                if (
                    relation.rel_type in NOISE_REL_TYPES
                    and relation.target_id.endswith(":db")
                    and view == "components"
                ):
                    # Keep persists edges but will barycenter-layout them
                    pass

            if view == "domain" and relation.architectural_level.value != "domain":
                dropped += 1
                continue

            if view == "database" and relation.architectural_level.value != "data":
                dropped += 1
                continue

            # Drop self-loops
            if relation.source_id == relation.target_id:
                dropped += 1
                continue

            kept.append(relation)

        # Deduplicate identical source→target pairs (keep first label)
        unique: list[ArchRelationship] = []
        seen: set[tuple[str, str]] = set()
        for relation in kept:
            key = (relation.source_id, relation.target_id)
            if key in seen:
                dropped += 1
                continue
            seen.add(key)
            unique.append(relation)

        # Component view: limit fan-out to DB — keep edge but OK
        _ = kinds
        return unique, dropped
