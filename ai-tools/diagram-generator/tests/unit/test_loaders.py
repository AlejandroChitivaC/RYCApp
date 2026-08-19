"""Unit tests for metadata loading and knowledge construction."""

from __future__ import annotations

from pathlib import Path

from loaders.knowledge_graph_loader import KnowledgeGraphLoader
from loaders.metadata_loader import MetadataLoader
from loaders.yaml_parser import YamlParser
from services.diagram_service import DiagramService


def test_load_json_modules(fixture_aikb: Path) -> None:
    loader = MetadataLoader(fixture_aikb / "11_METADATA")
    data = loader.load_json("modules.json")
    modules = loader.parse_modules(data)
    assert len(modules) == 2
    assert modules[0].id == "auth"
    assert modules[0].controller == "AuthController"


def test_parse_entities_and_relationships(fixture_aikb: Path) -> None:
    loader = MetadataLoader(fixture_aikb / "11_METADATA")
    entities = loader.parse_entities(loader.load_json("entities.json"))
    relations = loader.parse_relationships(loader.load_json("relationships.json"))
    assert {e.id for e in entities} == {"Usuario", "Rol"}
    assert relations[0].source == "Usuario"
    assert relations[0].rel_type == "many-to-one"


def test_invalid_json_raises(tmp_path: Path) -> None:
    bad = tmp_path / "broken.json"
    bad.write_text("{not-json", encoding="utf-8")
    loader = MetadataLoader(tmp_path)
    try:
        loader.load_json("broken.json")
        assert False, "expected ValueError"
    except ValueError as exc:
        assert "Invalid JSON" in str(exc)


def test_knowledge_graph_loader(fixture_aikb: Path) -> None:
    loader = MetadataLoader(fixture_aikb / "11_METADATA")
    graph = loader.load_json("knowledge-graph.json")
    kg = KnowledgeGraphLoader()
    nodes, edges = kg.load(graph)
    assert len(nodes) == 3
    assert len(edges) == 1
    assert kg.validate_edge_refs(nodes, edges) == []


def test_yaml_front_matter() -> None:
    parser = YamlParser()
    text = "---\nid: demo\ntitle: Demo\n---\n\n# Body\n"
    front, body = parser.split_front_matter(text)
    assert front["id"] == "demo"
    assert "# Body" in body


def test_diagram_service_builds_knowledge(
    fixture_aikb: Path,
    sample_config: dict,
    tmp_path: Path,
) -> None:
    service = DiagramService(sample_config, fixture_aikb, tmp_path)
    knowledge = service.load_knowledge()
    assert knowledge.name in {"FixtureApp", "Fixture App"} or "Fixture" in knowledge.name
    assert len(knowledge.modules) == 2
    assert len(knowledge.entities) == 2
    assert knowledge.integrations[0].id == "siigo"
    assert "diagram-sequence-auth" in knowledge.extracted_diagrams
    auth_rule = next(r for r in knowledge.business_rules if r.id == "BR-AUTH-01")
    assert auth_rule.description is not None
