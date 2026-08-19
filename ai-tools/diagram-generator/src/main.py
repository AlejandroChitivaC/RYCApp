#!/usr/bin/env python3
"""CLI entrypoint — AIKB Architecture Intelligence Engine."""

from __future__ import annotations

import argparse
import logging
import sys
from pathlib import Path
from typing import Any

SRC_DIR = Path(__file__).resolve().parent
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

from loaders.yaml_parser import YamlParser  # noqa: E402
from services.diagram_service import DIAGRAM_TYPES, DiagramService  # noqa: E402


def setup_logging(level: str) -> None:
    logging.basicConfig(
        level=getattr(logging, level.upper(), logging.INFO),
        format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%H:%M:%S",
    )


def resolve_path(base: Path, configured: str | Path) -> Path:
    path = Path(configured)
    if not path.is_absolute():
        path = (base / path).resolve()
    return path


def load_config(config_path: Path) -> dict[str, Any]:
    return YamlParser().parse_file(config_path)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="aikb-architecture-engine",
        description=(
            "AIKB Architecture Intelligence Engine — interpreta la AIKB, "
            "genera visualización C4 profesional y analiza calidad arquitectónica."
        ),
    )
    parser.add_argument("--config", default=None, help="Path to config.yaml")
    parser.add_argument("--input", default=None, help="Path to AIKB (ai-brain)")
    parser.add_argument("--output", default=None, help="Output directory")
    parser.add_argument(
        "--type",
        choices=sorted(DIAGRAM_TYPES),
        default=None,
        help="Generate a specific diagram family (legacy)",
    )
    parser.add_argument("--all", action="store_true", help="Generate default architecture pack")
    parser.add_argument(
        "--full-architecture",
        action="store_true",
        help="Generate full architecture documentation pack",
    )
    parser.add_argument("--c4-context", action="store_true", help="C4 Level 1 System Context")
    parser.add_argument("--c4-container", action="store_true", help="C4 Level 2 Containers")
    parser.add_argument("--c4-component", action="store_true", help="C4 Level 3 Components")
    parser.add_argument("--c4-code", action="store_true", help="C4 Level 4 Code (on demand)")
    parser.add_argument("--components", action="store_true", help="Component / module view")
    parser.add_argument("--domain", action="store_true", help="DDD domain view")
    parser.add_argument("--database", action="store_true", help="Database ER view")

    # Quality / analysis commands
    parser.add_argument(
        "--architecture-health",
        action="store_true",
        help="Generate architecture-health.json/.md + refactoring-recommendations.md",
    )
    parser.add_argument(
        "--analyze-coupling",
        action="store_true",
        help="Generate coupling analysis report",
    )
    parser.add_argument(
        "--analyze-spaghetti",
        action="store_true",
        help="Generate spaghetti / structural risk analysis",
    )
    parser.add_argument(
        "--generate-report",
        action="store_true",
        help="Full architecture diagrams + health + recommendations pack",
    )
    parser.add_argument("--log-level", default=None, help="DEBUG|INFO|WARNING|ERROR")
    return parser


def collect_views(args: argparse.Namespace) -> list[str]:
    views: list[str] = []
    if args.all or args.full_architecture:
        views.append("full-architecture")
    if args.c4_context:
        views.append("c4-context")
    if args.c4_container:
        views.append("c4-container")
    if args.c4_component:
        views.append("c4-component")
    if args.c4_code:
        views.append("c4-code")
    if args.components:
        views.append("components")
    if args.domain:
        views.append("domain")
    if args.database:
        views.append("database")
    if args.type:
        views.append(str(args.type))
    return views


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    project_root = SRC_DIR.parent
    config_path = (
        Path(args.config).resolve()
        if args.config
        else (project_root / "config.yaml").resolve()
    )
    if not config_path.is_file():
        print(f"ERROR: config not found: {config_path}", file=sys.stderr)
        return 2

    config = load_config(config_path)
    log_level = args.log_level or (config.get("logging") or {}).get("level") or "INFO"
    setup_logging(str(log_level))
    logger = logging.getLogger("main")

    paths = config.get("paths") or {}
    ai_brain = resolve_path(
        project_root,
        args.input or paths.get("ai_brain") or "../../ai-brain",
    )
    output = resolve_path(
        project_root,
        args.output or paths.get("output") or "./output",
    )

    analysis_requested = any(
        [
            args.architecture_health,
            args.analyze_coupling,
            args.analyze_spaghetti,
            args.generate_report,
        ]
    )
    views = collect_views(args)
    if not views and not analysis_requested:
        logger.error(
            "Specify a view or analysis flag, e.g. --full-architecture, "
            "--architecture-health, --analyze-coupling, --analyze-spaghetti, "
            "--generate-report"
        )
        return 2

    logger.info("AIKB input : %s", ai_brain)
    logger.info("Output dir : %s", output)

    service = DiagramService(config=config, ai_brain=ai_brain, output=output)
    written: list[Path] = []
    try:
        if args.generate_report:
            written.extend(service.run_generate_report())
        else:
            if views:
                logger.info("Views      : %s", ", ".join(views))
                written.extend(service.run_views(views))
            if args.architecture_health:
                written.extend(service.run_architecture_health())
            if args.analyze_coupling:
                written.extend(service.run_analyze_coupling())
            if args.analyze_spaghetti:
                written.extend(service.run_analyze_spaghetti())
    except (FileNotFoundError, ValueError) as exc:
        logger.error("%s", exc)
        return 1
    except Exception:  # noqa: BLE001
        logger.exception("Unexpected failure")
        return 1

    # Unique preserve order
    unique: list[Path] = []
    seen: set[str] = set()
    for path in written:
        key = str(path)
        if key in seen:
            continue
        seen.add(key)
        unique.append(path)

    logger.info("Done. Generated %s files:", len(unique))
    for path in unique:
        logger.info("  - %s", path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
