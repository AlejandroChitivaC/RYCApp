"""Refactoring intelligence — recommendations without modifying source."""

from __future__ import annotations

from architecture_engine.analyzers.models import Finding, HealthReport, Severity


class RefactoringAdvisor:
    """Suggest architectural refactors from quality findings (read-only advice)."""

    def recommend(self, report: HealthReport) -> list[str]:
        recommendations: list[str] = []
        seen: set[str] = set()

        for finding in report.findings:
            text = finding.recommendation or self._fallback(finding)
            if text and text not in seen:
                seen.add(text)
                prefix = f"[{finding.severity.value}] {finding.title}: "
                recommendations.append(prefix + text)

        # Cross-cutting playbook when score is low
        if report.score < 70:
            recommendations.append(
                "[PLAYBOOK] Priorizar ruptura de ciclos HIGH y reducir "
                "shared-kernel implícito antes de nuevas features."
            )
        if report.metrics.get("findings_medium", 0) >= 3:
            recommendations.append(
                "[PLAYBOOK] Aplicar extract service / separar responsabilidades "
                "en módulos con superficie alta; introducir ports donde falten."
            )
        if any(f.analyzer == "coupling" for f in report.findings):
            recommendations.append(
                "[PATTERN] Considerar Anti-Corruption Layer hacia Siigo y "
                "facades por bounded context para reducir acoplamiento cruzado."
            )

        report.recommendations = recommendations
        return recommendations

    def _fallback(self, finding: Finding) -> str:
        if finding.severity == Severity.HIGH:
            return "Eliminar dependencia circular aplicando inversión de dependencias."
        if finding.severity == Severity.MEDIUM:
            return "Separar responsabilidades y reducir acoplamiento del componente."
        return "Monitorear y documentar; refactor no urgente."
