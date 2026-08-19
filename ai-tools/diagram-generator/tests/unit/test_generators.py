"""Unit tests for architecture engine and upgraded generators."""

from __future__ import annotations

from pathlib import Path

from architecture_engine.selectors import ViewSelector
from architecture_engine.validators import ArchitectureValidator
from generators.c4_generator import C4Generator
from generators.drawio_generator import DrawioGenerator
from generators.mermaid_generator import MermaidGenerator
from generators.plantuml_generator import PlantUMLGenerator
from services.diagram_service import DiagramService


def _model(fixture_aikb: Path, sample_config: dict, tmp_path: Path):
    service = DiagramService(sample_config, fixture_aikb, tmp_path)
    knowledge = service.load_knowledge()
    return knowledge, service.build_architecture_model(knowledge)


def test_architecture_interpreter_builds_layers(
    fixture_aikb: Path,
    sample_config: dict,
    tmp_path: Path,
) -> None:
    knowledge, model = _model(fixture_aikb, sample_config, tmp_path)
    assert model.systems
    assert model.containers
    assert any(c.id == "container:spa" for c in model.containers)
    assert any(c.id == "container:api" for c in model.containers)
    assert any(c.id == "container:db" for c in model.containers)
    assert model.external_systems
    assert model.modules
    assert model.domain_entities
    assert knowledge.modules


def test_architecture_validator_ok(
    fixture_aikb: Path,
    sample_config: dict,
    tmp_path: Path,
) -> None:
    _, model = _model(fixture_aikb, sample_config, tmp_path)
    report = ArchitectureValidator().validate(model)
    assert report.ok


def test_view_selectors(
    fixture_aikb: Path,
    sample_config: dict,
    tmp_path: Path,
) -> None:
    _, model = _model(fixture_aikb, sample_config, tmp_path)
    selector = ViewSelector()
    ctx = selector.c4_context(model)
    assert any(e.kind.value == "system" for e in ctx.elements)
    assert not any(e.kind.value == "module" for e in ctx.elements)
    domain = selector.domain_view(model)
    assert domain.elements
    database = selector.database_view(model)
    assert database.elements


def test_mermaid_domain_uses_bounded_contexts(
    fixture_aikb: Path,
    sample_config: dict,
    tmp_path: Path,
) -> None:
    knowledge, model = _model(fixture_aikb, sample_config, tmp_path)
    content = MermaidGenerator(model, knowledge).domain_class_diagram()
    assert "classDiagram" in content
    assert "Usuario" in content
    assert "namespace" in content or "Rol" in content


def test_c4_context_has_no_modules(
    fixture_aikb: Path,
    sample_config: dict,
    tmp_path: Path,
) -> None:
    _, model = _model(fixture_aikb, sample_config, tmp_path)
    content = C4Generator(model).context()
    assert "C4_Context.puml" in content
    assert "Person(" in content
    assert "System(" in content
    assert "AuthController" not in content


def test_c4_container_includes_technology(
    fixture_aikb: Path,
    sample_config: dict,
    tmp_path: Path,
) -> None:
    _, model = _model(fixture_aikb, sample_config, tmp_path)
    content = C4Generator(model).container()
    assert "Container(" in content
    assert "Frontend" in content or "React" in content


def test_plantuml_and_drawio(
    fixture_aikb: Path,
    sample_config: dict,
    tmp_path: Path,
) -> None:
    knowledge, model = _model(fixture_aikb, sample_config, tmp_path)
    puml = PlantUMLGenerator(model, knowledge).domain_class()
    assert "@startuml" in puml
    drawio = DrawioGenerator(model).c4_context()
    assert drawio.startswith("<?xml")
    assert "mxGraphModel" in drawio
    assert "swimlane" in drawio or "Usuarios" in drawio


def test_end_to_end_full_architecture(
    fixture_aikb: Path,
    sample_config: dict,
    tmp_path: Path,
) -> None:
    service = DiagramService(sample_config, fixture_aikb, tmp_path)
    written = service.run_views(["full-architecture"])
    names = {path.name for path in written}
    assert "architecture.mmd" in names
    assert "c4-context.puml" in names
    assert "architecture.drawio" in names
    assert "domain.mmd" in names


def test_layer_classifier_rules() -> None:
    from architecture_engine.classifier import LayerClassifier
    from architecture_engine.models import ArchLayer

    clf = LayerClassifier()
    assert clf.classify_controller("AuthController") == ArchLayer.INTERFACE
    assert clf.classify_service("TicketService") == ArchLayer.APPLICATION
    assert clf.classify_repository("TicketRepository") == ArchLayer.INFRASTRUCTURE
    assert clf.classify_entity("Usuario", "domain/model/Usuario.java") == ArchLayer.DOMAIN
