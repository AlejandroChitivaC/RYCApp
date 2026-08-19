"""Enriched architecture model produced from AIKB evidence."""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any


class ArchLevel(str, Enum):
    """C4 / Clean Architecture level."""

    CONTEXT = "context"  # C4 L1
    CONTAINER = "container"  # C4 L2
    COMPONENT = "component"  # C4 L3
    CODE = "code"  # C4 L4
    DOMAIN = "domain"
    DATA = "data"


class ArchLayer(str, Enum):
    """Clean Architecture / Hexagonal layer."""

    INTERFACE = "interface"
    APPLICATION = "application"
    DOMAIN = "domain"
    INFRASTRUCTURE = "infrastructure"
    PRESENTATION = "presentation"
    EXTERNAL = "external"
    UNKNOWN = "unknown"


class ElementKind(str, Enum):
    ACTOR = "actor"
    SYSTEM = "system"
    CONTAINER = "container"
    COMPONENT = "component"
    MODULE = "module"
    SERVICE = "service"
    DOMAIN_ENTITY = "domain_entity"
    REPOSITORY = "repository"
    DATABASE_ENTITY = "database_entity"
    EXTERNAL_SYSTEM = "external_system"
    BOUNDED_CONTEXT = "bounded_context"
    AGGREGATE = "aggregate"


@dataclass(slots=True)
class ArchElement:
    """Base architectural element with C4/Clean metadata."""

    id: str
    name: str
    kind: ElementKind
    responsibility: str | None = None
    location: str | None = None
    description: str | None = None
    technology: str | None = None
    architectural_level: ArchLevel = ArchLevel.COMPONENT
    layer: ArchLayer = ArchLayer.UNKNOWN
    parent_id: str | None = None
    bounded_context: str | None = None
    dependencies: list[str] = field(default_factory=list)
    tags: list[str] = field(default_factory=list)
    evidence: list[str] = field(default_factory=list)
    metadata: dict[str, Any] = field(default_factory=dict)

    @property
    def display_label(self) -> str:
        parts = [self.name]
        if self.technology:
            parts.append(f"[{self.technology}]")
        if self.responsibility:
            parts.append(self.responsibility)
        return "\\n".join(parts)


@dataclass(slots=True)
class ArchRelationship:
    """Directed architectural relationship."""

    id: str
    source_id: str
    target_id: str
    rel_type: str
    label: str | None = None
    description: str | None = None
    architectural_level: ArchLevel = ArchLevel.COMPONENT
    evidence: list[str] = field(default_factory=list)


@dataclass(slots=True)
class BoundedContext:
    """DDD bounded context inferred from AIKB."""

    id: str
    name: str
    core_entities: list[str] = field(default_factory=list)
    modules: list[str] = field(default_factory=list)
    relations: str | None = None
    evidence: list[str] = field(default_factory=list)


@dataclass(slots=True)
class ArchitectureModel:
    """Interpreted architecture ready for professional diagram generation."""

    system_name: str
    system_description: str | None = None
    style: str | None = None
    actors: list[ArchElement] = field(default_factory=list)
    systems: list[ArchElement] = field(default_factory=list)
    containers: list[ArchElement] = field(default_factory=list)
    external_systems: list[ArchElement] = field(default_factory=list)
    components: list[ArchElement] = field(default_factory=list)
    modules: list[ArchElement] = field(default_factory=list)
    services: list[ArchElement] = field(default_factory=list)
    repositories: list[ArchElement] = field(default_factory=list)
    domain_entities: list[ArchElement] = field(default_factory=list)
    database_entities: list[ArchElement] = field(default_factory=list)
    bounded_contexts: list[BoundedContext] = field(default_factory=list)
    relationships: list[ArchRelationship] = field(default_factory=list)
    layer_responsibilities: dict[str, str] = field(default_factory=dict)
    warnings: list[str] = field(default_factory=list)
    notes: list[str] = field(default_factory=list)

    def element_by_id(self, element_id: str) -> ArchElement | None:
        for collection in (
            self.actors,
            self.systems,
            self.containers,
            self.external_systems,
            self.components,
            self.modules,
            self.services,
            self.repositories,
            self.domain_entities,
            self.database_entities,
        ):
            for element in collection:
                if element.id == element_id:
                    return element
        return None

    def relationships_for(
        self,
        *,
        level: ArchLevel | None = None,
        source_ids: set[str] | None = None,
    ) -> list[ArchRelationship]:
        result: list[ArchRelationship] = []
        for relation in self.relationships:
            if level is not None and relation.architectural_level != level:
                continue
            if source_ids is not None and relation.source_id not in source_ids:
                continue
            result.append(relation)
        return result

    def add_warning(self, message: str) -> None:
        warning = (
            message
            if message.startswith("Información no disponible")
            else f"Información no disponible en AIKB: {message}"
        )
        if warning not in self.warnings:
            self.warnings.append(warning)
