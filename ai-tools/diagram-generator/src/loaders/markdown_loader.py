"""Markdown document loader for the AIKB."""

from __future__ import annotations

import logging
import re
from pathlib import Path
from typing import Any

from .yaml_parser import YamlParser

logger = logging.getLogger(__name__)

MERMAID_BLOCK = re.compile(r"```mermaid\s*\n(.*?)```", re.DOTALL | re.IGNORECASE)
PLANTUML_BLOCK = re.compile(r"```plantuml\s*\n(.*?)```", re.DOTALL | re.IGNORECASE)
RULE_ROW = re.compile(
    r"^\|\s*(BR-[A-Z0-9-]+)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|$",
    re.MULTILINE,
)


class MarkdownLoader:
    """Load Markdown documents and extract structured fragments."""

    def __init__(self, yaml_parser: YamlParser | None = None) -> None:
        self._yaml = yaml_parser or YamlParser()

    def load_document(self, path: Path) -> dict[str, Any]:
        text = path.read_text(encoding="utf-8")
        front_matter, body = self._yaml.split_front_matter(text)
        return {
            "path": str(path),
            "relative": None,
            "front_matter": front_matter,
            "body": body,
            "mermaid": MERMAID_BLOCK.findall(body),
            "plantuml": PLANTUML_BLOCK.findall(body),
        }

    def load_tree(self, root: Path) -> dict[str, dict[str, Any]]:
        """Load all Markdown files under an AIKB root (read-only)."""
        documents: dict[str, dict[str, Any]] = {}
        if not root.is_dir():
            logger.warning("AIKB root is not a directory: %s", root)
            return documents

        for path in sorted(root.rglob("*.md")):
            if "generator" in path.parts:
                continue
            rel = path.relative_to(root).as_posix()
            try:
                doc = self.load_document(path)
            except OSError as exc:
                logger.error("Cannot read Markdown %s: %s", path, exc)
                continue
            doc["relative"] = rel
            documents[rel] = doc
            logger.debug("Loaded Markdown: %s", rel)
        return documents

    def extract_business_rule_descriptions(self, body: str) -> dict[str, str]:
        """Parse rule descriptions from BUSINESS_RULES.md table rows."""
        descriptions: dict[str, str] = {}
        for match in RULE_ROW.finditer(body):
            rule_id, description, _evidence = match.groups()
            descriptions[rule_id] = description.strip()
        return descriptions

    def collect_named_diagrams(self, documents: dict[str, dict[str, Any]]) -> dict[str, str]:
        """Collect Mermaid bodies keyed by diagram Markdown id / filename."""
        diagrams: dict[str, str] = {}
        for rel, doc in documents.items():
            if not rel.startswith("10_DIAGRAMS/"):
                continue
            mermaid_blocks = doc.get("mermaid") or []
            if not mermaid_blocks:
                continue
            front = doc.get("front_matter") or {}
            key = str(front.get("id") or Path(rel).stem)
            diagrams[key] = mermaid_blocks[0].strip()
        return diagrams
