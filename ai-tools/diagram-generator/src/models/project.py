"""Project-level knowledge aggregate built from the AIKB."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from .api import APIEndpoint
from .component import Component
from .entity import Entity
from .module import Module
from .relationship import Relationship


@dataclass(slots=True)
class BusinessRule:
    """Business rule reference from AIKB metadata."""

    id: str
    doc: str | None = None
    description: str | None = None


@dataclass(slots=True)
class Integration:
    """External integration declared in the AIKB."""

    id: str
    doc: str | None = None
    ports: list[str] = field(default_factory=list)
    classes: list[str] = field(default_factory=list)
    stage: str | None = None


@dataclass(slots=True)
class UseCase:
    """Use case reference from AIKB metadata."""

    id: str
    location: str | None = None


@dataclass(slots=True)
class ProjectKnowledge:
    """Intermediate knowledge model queried by all generators."""

    name: str
    full_name: str | None = None
    version: str | None = None
    generated: str | None = None
    modules: list[Module] = field(default_factory=list)
    entities: list[Entity] = field(default_factory=list)
    relationships: list[Relationship] = field(default_factory=list)
    apis: list[APIEndpoint] = field(default_factory=list)
    business_rules: list[BusinessRule] = field(default_factory=list)
    integrations: list[Integration] = field(default_factory=list)
    use_cases: list[UseCase] = field(default_factory=list)
    components: list[Component] = field(default_factory=list)
    graph_nodes: list[dict[str, Any]] = field(default_factory=list)
    graph_edges: list[dict[str, Any]] = field(default_factory=list)
    docs_by_topic: dict[str, str] = field(default_factory=dict)
    tech_stack: dict[str, Any] = field(default_factory=dict)
    extracted_diagrams: dict[str, str] = field(default_factory=dict)
    warnings: list[str] = field(default_factory=list)
    markdown_docs: dict[str, dict[str, Any]] = field(default_factory=dict)

    def entity_by_id(self, entity_id: str) -> Entity | None:
        for entity in self.entities:
            if entity.id == entity_id:
                return entity
        return None

    def module_by_id(self, module_id: str) -> Module | None:
        for module in self.modules:
            if module.id == module_id:
                return module
        return None

    def controllers(self) -> list[str]:
        controllers = {
            endpoint.controller
            for endpoint in self.apis
            if endpoint.controller
        }
        return sorted(controllers)

    def add_warning(self, message: str) -> None:
        warning = f"Información no disponible en AIKB: {message}"
        if warning not in self.warnings:
            self.warnings.append(warning)
