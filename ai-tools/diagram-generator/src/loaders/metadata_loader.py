"""JSON metadata loader for the AIKB."""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any

from models.api import APIEndpoint
from models.entity import Entity
from models.module import Module
from models.project import BusinessRule, Integration, UseCase
from models.relationship import Relationship

logger = logging.getLogger(__name__)

REQUIRED_METADATA_FILES = (
    "llm-index.json",
    "knowledge-graph.json",
    "entities.json",
    "modules.json",
    "relationships.json",
    "dependencies.json",
    "apis.json",
    "business-rules.json",
)


class MetadataLoader:
    """Load and map AIKB JSON metadata into internal models."""

    def __init__(self, metadata_dir: Path) -> None:
        self.metadata_dir = metadata_dir

    def load_json(self, filename: str) -> dict[str, Any]:
        path = self.metadata_dir / filename
        if not path.is_file():
            raise FileNotFoundError(f"Metadata file missing: {path}")
        try:
            with path.open(encoding="utf-8") as handle:
                data = json.load(handle)
        except json.JSONDecodeError as exc:
            raise ValueError(f"Invalid JSON in {path}: {exc}") from exc
        if not isinstance(data, dict):
            raise ValueError(f"Expected JSON object in {path}")
        return data

    def load_all(self) -> dict[str, dict[str, Any]]:
        payload: dict[str, dict[str, Any]] = {}
        for filename in REQUIRED_METADATA_FILES:
            payload[filename] = self.load_json(filename)

        optional = ("integrations.json", "use-cases.json", "consistency-audit.json")
        for filename in optional:
            path = self.metadata_dir / filename
            if path.is_file():
                payload[filename] = self.load_json(filename)
            else:
                logger.warning("Optional metadata missing: %s", filename)
        return payload

    def parse_modules(self, data: dict[str, Any]) -> list[Module]:
        modules: list[Module] = []
        for item in data.get("modules") or []:
            modules.append(
                Module(
                    id=str(item["id"]),
                    backend_doc=item.get("backend"),
                    frontend=item.get("frontend"),
                    controller=item.get("controller"),
                    note=item.get("note"),
                )
            )
        return modules

    def parse_entities(self, data: dict[str, Any]) -> list[Entity]:
        entities: list[Entity] = []
        for item in data.get("entities") or []:
            entities.append(
                Entity(
                    id=str(item["id"]),
                    path=item.get("path"),
                    fields=list(item.get("fields") or []),
                    layer=item.get("layer"),
                )
            )
        return entities

    def parse_relationships(self, data: dict[str, Any]) -> list[Relationship]:
        relationships: list[Relationship] = []
        for item in data.get("relationships") or []:
            relationships.append(
                Relationship(
                    source=str(item["from"]),
                    target=str(item["to"]),
                    rel_type=str(item.get("type") or "related"),
                    role=item.get("role"),
                    layer=item.get("layer"),
                )
            )
        return relationships

    def parse_apis(self, data: dict[str, Any]) -> list[APIEndpoint]:
        endpoints: list[APIEndpoint] = []
        for item in data.get("endpoints") or []:
            endpoints.append(
                APIEndpoint(
                    method=str(item.get("method") or "GET"),
                    path=str(item.get("path") or ""),
                    auth=item.get("auth"),
                    controller=item.get("controller"),
                )
            )
        return endpoints

    def parse_business_rules(self, data: dict[str, Any]) -> list[BusinessRule]:
        rules: list[BusinessRule] = []
        for item in data.get("rules") or []:
            rules.append(
                BusinessRule(
                    id=str(item["id"]),
                    doc=item.get("doc"),
                )
            )
        return rules

    def parse_integrations(self, data: dict[str, Any] | None) -> list[Integration]:
        if not data:
            return []
        integrations: list[Integration] = []
        for item in data.get("integrations") or []:
            integrations.append(
                Integration(
                    id=str(item["id"]),
                    doc=item.get("doc"),
                    ports=list(item.get("ports") or []),
                    classes=list(item.get("classes") or []),
                    stage=item.get("stage"),
                )
            )
        return integrations

    def parse_use_cases(self, data: dict[str, Any] | None) -> list[UseCase]:
        if not data:
            return []
        use_cases: list[UseCase] = []
        for item in data.get("use_cases") or []:
            use_cases.append(
                UseCase(
                    id=str(item["id"]),
                    location=item.get("location"),
                )
            )
        return use_cases
