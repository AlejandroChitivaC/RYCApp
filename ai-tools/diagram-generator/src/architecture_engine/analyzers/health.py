"""Architecture Health Score aggregator."""

from __future__ import annotations

from datetime import date

from architecture_engine.analyzers.circular import CircularDependencyAnalyzer
from architecture_engine.analyzers.cohesion import CohesionAnalyzer
from architecture_engine.analyzers.complexity import ComplexityAnalyzer
from architecture_engine.analyzers.coupling import CouplingAnalyzer
from architecture_engine.analyzers.models import Finding, HealthReport, Severity
from architecture_engine.models import ArchitectureModel

SEVERITY_PENALTY = {
    Severity.HIGH: 12,
    Severity.MEDIUM: 5,
    Severity.LOW: 2,
}

# Soft floor: modular monoliths with documented tech-debt should not collapse to 0
SCORE_FLOOR = 40


class ArchitectureHealthAnalyzer:
    """Run all analyzers and compute Architecture Health Score."""

    def __init__(self) -> None:
        self.coupling = CouplingAnalyzer()
        self.cohesion = CohesionAnalyzer()
        self.circular = CircularDependencyAnalyzer()
        self.complexity = ComplexityAnalyzer()

    def analyze(
        self,
        model: ArchitectureModel,
        *,
        version: str | None = None,
    ) -> HealthReport:
        coupling_metrics, coupling_findings = self.coupling.analyze(model)
        findings: list[Finding] = []
        findings.extend(coupling_findings)
        findings.extend(self.cohesion.analyze(model))
        findings.extend(self.circular.analyze(model))
        findings.extend(self.complexity.analyze(model))

        # Deduplicate by id
        unique: dict[str, Finding] = {}
        for finding in findings:
            unique[finding.id] = finding
        findings = list(unique.values())
        findings.sort(
            key=lambda f: (
                {"HIGH": 0, "MEDIUM": 1, "LOW": 2}[f.severity.value],
                f.id,
            )
        )

        score = 100
        for finding in findings:
            score -= SEVERITY_PENALTY[finding.severity]
        score = max(0, min(100, score))
        if score < SCORE_FLOOR and not any(f.severity == Severity.HIGH for f in findings):
            score = SCORE_FLOOR
        score = max(0, min(100, score))

        report = HealthReport(
            system_name=model.system_name,
            score=score,
            generated_on=date.today().isoformat(),
            version=version,
            findings=findings,
            coupling=coupling_metrics,
            metrics={
                "modules": len(model.modules),
                "services": len(model.services),
                "domain_entities": len(model.domain_entities),
                "bounded_contexts": len(model.bounded_contexts),
                "relationships": len(model.relationships),
                "findings_high": len([f for f in findings if f.severity == Severity.HIGH]),
                "findings_medium": len(
                    [f for f in findings if f.severity == Severity.MEDIUM]
                ),
                "findings_low": len([f for f in findings if f.severity == Severity.LOW]),
            },
        )
        return report
