"""Header helpers shared by text-based generators."""

from __future__ import annotations

from visualization_engine.models import VisualDocument


def mermaid_header(document: VisualDocument) -> list[str]:
    ann = document.annotation
    lines = [
        f"%% {ann.title}",
        f"%% System: {ann.system_name or ''}",
        f"%% Generated: {ann.generated_on}",
    ]
    if ann.version:
        lines.append(f"%% Version: {ann.version}")
    if ann.c4_level:
        lines.append(f"%% C4 Level: {ann.c4_level}")
    for tech in ann.technologies[:4]:
        lines.append(f"%% Tech: {tech}")
    for item in ann.legend[:4]:
        lines.append(f"%% Legend: {item}")
    return lines


def plantuml_header(document: VisualDocument) -> list[str]:
    ann = document.annotation
    lines = [
        f"' {ann.title}",
        f"' System: {ann.system_name or ''}",
        f"' Generated: {ann.generated_on}",
    ]
    if ann.version:
        lines.append(f"' Version: {ann.version}")
    if ann.c4_level:
        lines.append(f"' C4 Level: {ann.c4_level}")
    for item in ann.legend[:4]:
        lines.append(f"' Legend: {item}")
    return lines
