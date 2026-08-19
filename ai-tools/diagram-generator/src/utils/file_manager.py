"""File system helpers (write-only under output/)."""

from __future__ import annotations

import logging
from pathlib import Path

logger = logging.getLogger(__name__)


class FileManager:
    """Manage diagram output directories and file writes."""

    def __init__(self, output_root: Path) -> None:
        self.output_root = output_root

    def ensure_layout(self) -> None:
        for subdirectory in ("drawio", "mermaid", "plantuml"):
            path = self.output_root / subdirectory
            path.mkdir(parents=True, exist_ok=True)
            logger.debug("Ensured output directory: %s", path)

    def write_text(self, relative_path: str, content: str) -> Path:
        target = self.output_root / relative_path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(content, encoding="utf-8", newline="\n")
        logger.info("Wrote %s (%s bytes)", target, target.stat().st_size)
        return target

    def resolve(self, *parts: str) -> Path:
        return self.output_root.joinpath(*parts)
