"""Write architecture-health and refactoring recommendation artifacts."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from architecture_engine.analyzers.models import HealthReport, Severity


class HealthReportWriter:
    """Persist health reports as JSON + Markdown (never modifies product code)."""

    def write_json(self, report: HealthReport, path: Path) -> Path:
        payload = self._to_dict(report)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(
            json.dumps(payload, indent=2, ensure_ascii=False) + "\n",
            encoding="utf-8",
            newline="\n",
        )
        return path

    def write_markdown(self, report: HealthReport, path: Path) -> Path:
        lines = [
            f"# Architecture Health — {report.system_name}",
            "",
            f"**Score:** {report.score_label}",
            "",
            f"Generated: {report.generated_on}",
        ]
        if report.version:
            lines.append(f"Version: {report.version}")
        lines.extend(["", "## Summary metrics", ""])
        for key, value in report.metrics.items():
            lines.append(f"- `{key}`: {value}")

        lines.extend(["", "## Findings", ""])
        for severity in (Severity.HIGH, Severity.MEDIUM, Severity.LOW):
            group = report.by_severity(severity)
            if not group:
                continue
            lines.append(f"### {severity.value}")
            lines.append("")
            for finding in group:
                lines.append(f"- **{finding.title}**")
                lines.append(f"  - {finding.detail}")
                if finding.recommendation:
                    lines.append(f"  - Rec: {finding.recommendation}")
                if finding.evidence:
                    lines.append(f"  - Evidence: {', '.join(finding.evidence)}")
            lines.append("")

        if report.coupling:
            lines.extend(["## Coupling metrics", ""])
            lines.append("| Module | Ca (in) | Ce (out) | Instability |")
            lines.append("|--------|---------|----------|-------------|")
            for row in report.coupling[:20]:
                lines.append(
                    f"| {row.module_id} | {row.afferent} | {row.efferent} | "
                    f"{row.instability:.3f} |"
                )
            lines.append("")

        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text("\n".join(lines) + "\n", encoding="utf-8", newline="\n")
        return path

    def write_refactoring(self, report: HealthReport, path: Path) -> Path:
        lines = [
            f"# Refactoring Recommendations — {report.system_name}",
            "",
            "> Solo lectura: estas sugerencias **no modifican** código fuente.",
            "",
            f"Health score de referencia: **{report.score_label}**",
            "",
            "## Recomendaciones",
            "",
        ]
        if not report.recommendations:
            lines.append("- No hay recomendaciones generadas.")
        for index, item in enumerate(report.recommendations, start=1):
            lines.append(f"{index}. {item}")
        lines.extend(
            [
                "",
                "## Patrones sugeridos (cuando aplique)",
                "",
                "- Extraer servicios / use cases cohesivos",
                "- Separar responsabilidades por bounded context",
                "- Aplicar ports & adapters / Anti-Corruption Layer",
                "- Reducir acoplamiento entre contextos (shared kernel explícito)",
                "",
            ]
        )
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text("\n".join(lines) + "\n", encoding="utf-8", newline="\n")
        return path

    def _to_dict(self, report: HealthReport) -> dict[str, Any]:
        return {
            "system": report.system_name,
            "score": report.score,
            "score_label": report.score_label,
            "max_score": report.max_score,
            "generated_on": report.generated_on,
            "version": report.version,
            "metrics": report.metrics,
            "findings": [
                {
                    "id": f.id,
                    "analyzer": f.analyzer,
                    "severity": f.severity.value,
                    "title": f.title,
                    "detail": f.detail,
                    "evidence": f.evidence,
                    "recommendation": f.recommendation,
                    "metadata": f.metadata,
                }
                for f in report.findings
            ],
            "coupling": [
                {
                    "module": c.module_id,
                    "afferent": c.afferent,
                    "efferent": c.efferent,
                    "instability": c.instability,
                }
                for c in report.coupling
            ],
            "recommendations": report.recommendations,
        }
