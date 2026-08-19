"""Orchestration: AIKB → ProjectKnowledge → ArchitectureModel → diagrams."""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

from architecture_engine.interpreter import ArchitectureInterpreter
from architecture_engine.models import ArchitectureModel
from architecture_engine.validators import ArchitectureValidator
from generators.c4_generator import C4Generator
from generators.drawio_generator import DrawioGenerator
from generators.mermaid_generator import MermaidGenerator
from generators.plantuml_generator import PlantUMLGenerator
from loaders.knowledge_graph_loader import KnowledgeGraphLoader
from loaders.markdown_loader import MarkdownLoader
from loaders.metadata_loader import MetadataLoader
from loaders.yaml_parser import YamlParser
from models.project import ProjectKnowledge
from services.analysis_service import AnalysisService
from utils.file_manager import FileManager
from utils.validators import Validators
from visualization_engine.engine import VisualizationEngine

logger = logging.getLogger(__name__)

DIAGRAM_TYPES = (
    "architecture",
    "domain",
    "database",
    "components",
    "dependencies",
    "sequence",
    "c4",
    "c4-context",
    "c4-container",
    "c4-component",
    "c4-code",
    "full-architecture",
    "code",
)

# Views included in --all / --full-architecture (code/L4 excluded)
DEFAULT_VIEWS = (
    "architecture",
    "domain",
    "database",
    "components",
    "dependencies",
    "sequence",
    "c4-context",
    "c4-container",
    "c4-component",
)


class DiagramService:
    """High-level facade for the Diagram Intelligence Engine v2."""

    def __init__(self, config: dict[str, Any], ai_brain: Path, output: Path) -> None:
        self.config = config
        self.ai_brain = ai_brain
        self.output = output
        self.file_manager = FileManager(output)
        self.validators = Validators(ai_brain)
        self.yaml_parser = YamlParser()
        self.markdown_loader = MarkdownLoader(self.yaml_parser)
        self.kg_loader = KnowledgeGraphLoader()
        self.interpreter = ArchitectureInterpreter()
        self.arch_validator = ArchitectureValidator()
        self._version: str | None = None

    def load_knowledge(self) -> ProjectKnowledge:
        report = self.validators.validate_structure()
        for warning in report.warnings:
            logger.warning(warning)
        report.raise_if_invalid()

        metadata_loader = MetadataLoader(self.ai_brain / "11_METADATA")
        payload = metadata_loader.load_all()
        llm_index = payload["llm-index.json"]
        project_cfg = self.config.get("project") or {}
        name = str(project_cfg.get("name") or llm_index.get("project") or "Project")
        full_name = project_cfg.get("full_name") or llm_index.get("project")

        knowledge = ProjectKnowledge(
            name=name,
            full_name=full_name,
            version=str(llm_index.get("version") or ""),
            generated=str(llm_index.get("generated") or ""),
            modules=metadata_loader.parse_modules(payload["modules.json"]),
            entities=metadata_loader.parse_entities(payload["entities.json"]),
            relationships=metadata_loader.parse_relationships(
                payload["relationships.json"]
            ),
            apis=metadata_loader.parse_apis(payload["apis.json"]),
            business_rules=metadata_loader.parse_business_rules(
                payload["business-rules.json"]
            ),
            integrations=metadata_loader.parse_integrations(
                payload.get("integrations.json")
            ),
            use_cases=metadata_loader.parse_use_cases(payload.get("use-cases.json")),
            docs_by_topic=dict(llm_index.get("docs_by_topic") or {}),
            tech_stack=dict(
                (payload.get("dependencies.json") or {}).get("dependencies") or {}
            ),
        )

        nodes, edges = self.kg_loader.load(payload["knowledge-graph.json"])
        knowledge.graph_nodes = nodes
        knowledge.graph_edges = edges
        for message in self.kg_loader.validate_edge_refs(nodes, edges):
            knowledge.add_warning(message)

        documents = self.markdown_loader.load_tree(self.ai_brain)
        knowledge.markdown_docs = documents
        knowledge.extracted_diagrams = self.markdown_loader.collect_named_diagrams(
            documents
        )

        rules_doc = documents.get("02_DOMAIN/BUSINESS_RULES.md")
        if rules_doc:
            descriptions = self.markdown_loader.extract_business_rule_descriptions(
                rules_doc.get("body") or ""
            )
            for rule in knowledge.business_rules:
                rule.description = descriptions.get(rule.id)
                if rule.description is None:
                    knowledge.add_warning(f"business rule description for {rule.id}")

        knowledge_report = self.validators.validate_knowledge(knowledge)
        for warning in knowledge_report.warnings:
            logger.warning(warning)
        knowledge_report.raise_if_invalid()
        self._version = knowledge.version
        return knowledge

    def build_architecture_model(self, knowledge: ProjectKnowledge) -> ArchitectureModel:
        model = self.interpreter.interpret(knowledge)
        validation = self.arch_validator.validate(model)
        if not validation.ok:
            raise ValueError("; ".join(validation.errors))
        for warning in model.warnings:
            logger.warning(warning)
        return model

    def _expand_views(self, views: list[str] | None) -> set[str]:
        if views is None:
            return set(DEFAULT_VIEWS)
        expanded: set[str] = set()
        for view in views:
            if view in {"all", "full-architecture"}:
                expanded.update(DEFAULT_VIEWS)
            elif view == "c4":
                expanded.update({"c4-context", "c4-container", "c4-component"})
            elif view == "code":
                expanded.add("c4-code")
            else:
                expanded.add(view)
        return expanded

    def generate(
        self,
        knowledge: ProjectKnowledge,
        model: ArchitectureModel,
        diagram_types: list[str] | None = None,
    ) -> list[Path]:
        self.file_manager.ensure_layout()
        views = self._expand_views(diagram_types)
        generators_cfg = self.config.get("generators") or {}
        styles = (self.config.get("styles") or {}).get("drawio") or {}
        written: list[Path] = []

        mermaid = MermaidGenerator(model, knowledge, version=self._version)
        plantuml = PlantUMLGenerator(model, knowledge)
        drawio = DrawioGenerator(model, styles=styles, version=self._version)
        c4 = C4Generator(model, version=self._version)
        # Warm visualization engine for logging purity stats on primary views
        viz = VisualizationEngine(version=self._version)
        for preview in ("c4-context", "c4-container", "components", "domain"):
            if preview in views or "architecture" in views:
                viz.compose(model, preview if preview != "architecture" else "architecture")
                break

        def emit(relative: str, content: str) -> None:
            written.append(self.file_manager.write_text(relative, content))

        if generators_cfg.get("mermaid", True):
            if "architecture" in views or "full-architecture" in views:
                emit("mermaid/architecture.mmd", mermaid.architecture_flowchart())
            if "domain" in views:
                emit("mermaid/domain.mmd", mermaid.domain_class_diagram())
            if "database" in views:
                emit("mermaid/database.mmd", mermaid.database_er_diagram())
            if "dependencies" in views or "architecture" in views:
                emit("mermaid/dependencies.mmd", mermaid.dependencies_flowchart())
            if "components" in views or "c4-component" in views:
                emit("mermaid/components.mmd", mermaid.components_flowchart())
            if "sequence" in views:
                emit("mermaid/sequence.mmd", mermaid.sequence_diagram())
            if "c4-context" in views or "architecture" in views:
                emit("mermaid/c4-context.mmd", c4.context_mermaid())
            if "c4-container" in views or "architecture" in views:
                emit("mermaid/c4-container.mmd", c4.container_mermaid())

        if generators_cfg.get("plantuml", True) or generators_cfg.get("c4", True):
            if "architecture" in views:
                emit("plantuml/architecture.puml", plantuml.architecture())
            if "components" in views or "c4-component" in views:
                emit("plantuml/components.puml", plantuml.components())
            if "domain" in views:
                emit("plantuml/domain.puml", plantuml.domain_class())
            if "sequence" in views:
                emit("plantuml/sequence.puml", plantuml.sequence())
            if "database" in views:
                emit("plantuml/database.puml", plantuml.database_er())
            if "c4-context" in views or "architecture" in views:
                emit("plantuml/c4-context.puml", c4.context())
            if "c4-container" in views or "architecture" in views:
                emit("plantuml/c4-container.puml", c4.container())
            if "c4-component" in views or "components" in views:
                emit("plantuml/c4-component.puml", c4.component())
            if "c4-code" in views:
                emit("plantuml/c4-code.puml", c4.code())

        if generators_cfg.get("drawio", True):
            if "architecture" in views:
                emit("drawio/architecture.drawio", drawio.architecture())
            if "domain" in views:
                emit("drawio/domain.drawio", drawio.domain())
            if "database" in views:
                emit("drawio/database.drawio", drawio.database())
            if "components" in views or "c4-component" in views:
                emit("drawio/components.drawio", drawio.components())
            if "c4-context" in views:
                emit("drawio/c4-context.drawio", drawio.c4_context())
            if "c4-container" in views:
                emit("drawio/c4-container.drawio", drawio.c4_container())

        logger.info("Generated %s diagram files under %s", len(written), self.output)
        return written

    def run_all(self) -> list[Path]:
        knowledge = self.load_knowledge()
        model = self.build_architecture_model(knowledge)
        return self.generate(knowledge, model, diagram_types=None)

    def run_type(self, diagram_type: str) -> list[Path]:
        if diagram_type not in DIAGRAM_TYPES and diagram_type != "all":
            raise ValueError(
                f"Unknown diagram type '{diagram_type}'. "
                f"Supported: {', '.join(DIAGRAM_TYPES)}"
            )
        knowledge = self.load_knowledge()
        model = self.build_architecture_model(knowledge)
        return self.generate(knowledge, model, diagram_types=[diagram_type])

    def run_views(self, views: list[str]) -> list[Path]:
        knowledge = self.load_knowledge()
        model = self.build_architecture_model(knowledge)
        return self.generate(knowledge, model, diagram_types=views)

    def run_architecture_health(self) -> list[Path]:
        knowledge = self.load_knowledge()
        model = self.build_architecture_model(knowledge)
        analysis = AnalysisService(self.output, version=knowledge.version)
        _, written = analysis.run_health(model)
        return written

    def run_analyze_coupling(self) -> list[Path]:
        knowledge = self.load_knowledge()
        model = self.build_architecture_model(knowledge)
        return AnalysisService(self.output, version=knowledge.version).run_coupling_report(
            model
        )

    def run_analyze_spaghetti(self) -> list[Path]:
        knowledge = self.load_knowledge()
        model = self.build_architecture_model(knowledge)
        return AnalysisService(self.output, version=knowledge.version).run_spaghetti_report(
            model
        )

    def run_generate_report(self) -> list[Path]:
        knowledge = self.load_knowledge()
        model = self.build_architecture_model(knowledge)
        # diagrams + quality pack
        written = self.generate(knowledge, model, diagram_types=["full-architecture"])
        written.extend(
            AnalysisService(self.output, version=knowledge.version).generate_full_report(
                model
            )
        )
        return written
