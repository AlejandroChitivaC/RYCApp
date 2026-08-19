"""Architecture analysis facade (read-only reports)."""

from __future__ import annotations

import logging
from pathlib import Path

from architecture_engine.analyzers.health import ArchitectureHealthAnalyzer
from architecture_engine.analyzers.models import HealthReport, Severity
from architecture_engine.analyzers.refactoring import RefactoringAdvisor
from architecture_engine.analyzers.report_writer import HealthReportWriter
from architecture_engine.models import ArchitectureModel
from utils.file_manager import FileManager

logger = logging.getLogger(__name__)


class AnalysisService:
    """Run architecture quality analyzers and emit reports under output/reports."""

    def __init__(self, output: Path, *, version: str | None = None) -> None:
        self.output = output
        self.version = version
        self.file_manager = FileManager(output)
        self.health = ArchitectureHealthAnalyzer()
        self.advisor = RefactoringAdvisor()
        self.writer = HealthReportWriter()

    def run_health(self, model: ArchitectureModel) -> tuple[HealthReport, list[Path]]:
        report = self.health.analyze(model, version=self.version)
        self.advisor.recommend(report)
        reports_dir = self.output / "reports"
        written = [
            self.writer.write_json(report, reports_dir / "architecture-health.json"),
            self.writer.write_markdown(report, reports_dir / "architecture-health.md"),
            self.writer.write_refactoring(
                report, reports_dir / "refactoring-recommendations.md"
            ),
        ]
        logger.info("Architecture health score: %s", report.score_label)
        return report, written

    def run_coupling_report(self, model: ArchitectureModel) -> list[Path]:
        report = self.health.analyze(model, version=self.version)
        coupling_only = [
            f for f in report.findings if f.analyzer == "coupling"
        ]
        report.findings = coupling_only
        self.advisor.recommend(report)
        path = self.output / "reports" / "coupling-analysis.md"
        lines = [
            f"# Coupling Analysis — {model.system_name}",
            "",
            "| Module | Ca | Ce | Instability |",
            "|--------|----|----|-------------|",
        ]
        for row in report.coupling:
            lines.append(
                f"| {row.module_id} | {row.afferent} | {row.efferent} | "
                f"{row.instability:.3f} |"
            )
        lines.extend(["", "## Findings", ""])
        if not coupling_only:
            lines.append("- Sin hallazgos de acoplamiento significativos.")
        for finding in coupling_only:
            lines.append(f"- **[{finding.severity.value}]** {finding.title}: {finding.detail}")
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text("\n".join(lines) + "\n", encoding="utf-8", newline="\n")
        return [path]

    def run_spaghetti_report(self, model: ArchitectureModel) -> list[Path]:
        report = self.health.analyze(model, version=self.version)
        spaghetti = [
            f
            for f in report.findings
            if f.analyzer in {"circular", "complexity", "coupling", "cohesion"}
            and (
                f.severity in {Severity.HIGH, Severity.MEDIUM}
                or f.analyzer == "circular"
            )
        ]
        path = self.output / "reports" / "spaghetti-analysis.md"
        lines = [
            f"# Spaghetti / Structural Risk Analysis — {model.system_name}",
            "",
            "Combina ciclos, acoplamiento alto, baja cohesión y complejidad.",
            "",
            f"Health score de referencia: **{report.score_label}**",
            "",
            "## Riesgos",
            "",
        ]
        if not spaghetti:
            lines.append("- No se detectó estructura tipo spaghetti a nivel AIKB.")
        for finding in spaghetti:
            lines.append(f"### [{finding.severity.value}] {finding.title}")
            lines.append("")
            lines.append(finding.detail)
            if finding.recommendation:
                lines.append("")
                lines.append(f"**Acción sugerida:** {finding.recommendation}")
            lines.append("")
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text("\n".join(lines) + "\n", encoding="utf-8", newline="\n")
        return [path]

    def generate_full_report(self, model: ArchitectureModel) -> list[Path]:
        _, health_files = self.run_health(model)
        written = list(health_files)
        written.extend(self.run_coupling_report(model))
        written.extend(self.run_spaghetti_report(model))
        # Executive summary
        report = self.health.analyze(model, version=self.version)
        self.advisor.recommend(report)
        summary = self.output / "reports" / "architecture-report.md"
        lines = [
            f"# Architecture Intelligence Report — {model.system_name}",
            "",
            f"**Health Score:** {report.score_label}",
            "",
            f"Generated: {report.generated_on}",
            "",
            "## Executive summary",
            "",
            f"- Módulos: {report.metrics.get('modules')}",
            f"- Bounded contexts: {report.metrics.get('bounded_contexts')}",
            f"- Findings HIGH/MEDIUM/LOW: "
            f"{report.metrics.get('findings_high')}/"
            f"{report.metrics.get('findings_medium')}/"
            f"{report.metrics.get('findings_low')}",
            "",
            "## Artifacts",
            "",
            "- `architecture-health.json`",
            "- `architecture-health.md`",
            "- `refactoring-recommendations.md`",
            "- `coupling-analysis.md`",
            "- `spaghetti-analysis.md`",
            "",
            "## Top recommendations",
            "",
        ]
        for item in report.recommendations[:8]:
            lines.append(f"- {item}")
        summary.parent.mkdir(parents=True, exist_ok=True)
        summary.write_text("\n".join(lines) + "\n", encoding="utf-8", newline="\n")
        written.append(summary)
        return written
