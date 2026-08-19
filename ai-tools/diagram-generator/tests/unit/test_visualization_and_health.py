"""Tests for visualization engine and architecture quality analyzers."""

from __future__ import annotations

from pathlib import Path

from architecture_engine.analyzers.health import ArchitectureHealthAnalyzer
from architecture_engine.analyzers.refactoring import RefactoringAdvisor
from architecture_engine.models import ElementKind
from services.diagram_service import DiagramService
from visualization_engine.c4_rules import C4Rules
from visualization_engine.engine import VisualizationEngine


def _model(fixture_aikb: Path, sample_config: dict, tmp_path: Path):
    service = DiagramService(sample_config, fixture_aikb, tmp_path)
    knowledge = service.load_knowledge()
    return knowledge, service.build_architecture_model(knowledge)


def test_c4_context_excludes_modules(
    fixture_aikb: Path,
    sample_config: dict,
    tmp_path: Path,
) -> None:
    _, model = _model(fixture_aikb, sample_config, tmp_path)
    doc = VisualizationEngine().compose(model, "c4-context")
    kinds = {e.kind for e in doc.elements}
    assert ElementKind.MODULE not in kinds
    assert ElementKind.ACTOR in kinds or ElementKind.SYSTEM in kinds


def test_c4_container_excludes_modules(
    fixture_aikb: Path,
    sample_config: dict,
    tmp_path: Path,
) -> None:
    _, model = _model(fixture_aikb, sample_config, tmp_path)
    doc = VisualizationEngine().compose(model, "c4-container")
    assert all(e.kind != ElementKind.MODULE for e in doc.elements)
    assert any(e.kind == ElementKind.CONTAINER for e in doc.elements)


def test_visual_annotations_present(
    fixture_aikb: Path,
    sample_config: dict,
    tmp_path: Path,
) -> None:
    _, model = _model(fixture_aikb, sample_config, tmp_path)
    doc = VisualizationEngine(version="1.0.0").compose(model, "c4-container")
    assert doc.annotation.title
    assert doc.annotation.generated_on
    assert doc.annotation.legend
    assert doc.annotation.version == "1.0.0"


def test_c4_rules_purity() -> None:
    rules = C4Rules()
    allowed = rules.allowed_kinds("c4-context")
    assert allowed is not None
    assert ElementKind.MODULE not in allowed


def test_architecture_health_score(
    fixture_aikb: Path,
    sample_config: dict,
    tmp_path: Path,
) -> None:
    _, model = _model(fixture_aikb, sample_config, tmp_path)
    report = ArchitectureHealthAnalyzer().analyze(model, version="1.0.0")
    assert 0 <= report.score <= 100
    RefactoringAdvisor().recommend(report)
    assert isinstance(report.recommendations, list)


def test_cli_architecture_health_writes_reports(
    fixture_aikb: Path,
    sample_config: dict,
    tmp_path: Path,
) -> None:
    service = DiagramService(sample_config, fixture_aikb, tmp_path)
    written = service.run_architecture_health()
    names = {p.name for p in written}
    assert "architecture-health.json" in names
    assert "architecture-health.md" in names
    assert "refactoring-recommendations.md" in names


def test_analyze_coupling_and_spaghetti(
    fixture_aikb: Path,
    sample_config: dict,
    tmp_path: Path,
) -> None:
    service = DiagramService(sample_config, fixture_aikb, tmp_path)
    coupling = service.run_analyze_coupling()
    spaghetti = service.run_analyze_spaghetti()
    assert any(p.name == "coupling-analysis.md" for p in coupling)
    assert any(p.name == "spaghetti-analysis.md" for p in spaghetti)
