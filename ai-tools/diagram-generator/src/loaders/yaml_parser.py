"""YAML front-matter and config parsing helpers."""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

import yaml

logger = logging.getLogger(__name__)

FRONT_MATTER_DELIMITER = "---"


class YamlParser:
    """Parse YAML front matter from Markdown and configuration files."""

    def parse_file(self, path: Path) -> dict[str, Any]:
        if not path.is_file():
            raise FileNotFoundError(f"YAML file not found: {path}")
        with path.open(encoding="utf-8") as handle:
            data = yaml.safe_load(handle) or {}
        if not isinstance(data, dict):
            raise ValueError(f"Expected mapping in YAML file: {path}")
        return data

    def split_front_matter(self, text: str) -> tuple[dict[str, Any], str]:
        """Return (front_matter, body) from a Markdown document."""
        stripped = text.lstrip("\ufeff")
        if not stripped.startswith(FRONT_MATTER_DELIMITER):
            return {}, text

        lines = stripped.splitlines(keepends=True)
        if not lines or lines[0].strip() != FRONT_MATTER_DELIMITER:
            return {}, text

        yaml_lines: list[str] = []
        end_index: int | None = None
        for index, line in enumerate(lines[1:], start=1):
            if line.strip() == FRONT_MATTER_DELIMITER:
                end_index = index
                break
            yaml_lines.append(line)

        if end_index is None:
            logger.warning("Front matter delimiter not closed; treating as plain Markdown")
            return {}, text

        front_raw = "".join(yaml_lines)
        body = "".join(lines[end_index + 1 :])
        try:
            front = yaml.safe_load(front_raw) or {}
        except yaml.YAMLError as exc:
            logger.warning("Invalid YAML front matter: %s", exc)
            return {}, text

        if not isinstance(front, dict):
            logger.warning("Front matter is not a mapping; ignoring")
            return {}, text
        return front, body
