"""Shared models for architecture quality analysis."""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any


class Severity(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


@dataclass(slots=True)
class Finding:
    id: str
    analyzer: str
    severity: Severity
    title: str
    detail: str
    evidence: list[str] = field(default_factory=list)
    recommendation: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass(slots=True)
class CouplingMetrics:
    module_id: str
    afferent: int  # incoming
    efferent: int  # outgoing
    instability: float  # Ce / (Ca + Ce)


@dataclass(slots=True)
class HealthReport:
    system_name: str
    score: int
    max_score: int = 100
    generated_on: str = ""
    version: str | None = None
    findings: list[Finding] = field(default_factory=list)
    coupling: list[CouplingMetrics] = field(default_factory=list)
    metrics: dict[str, Any] = field(default_factory=dict)
    recommendations: list[str] = field(default_factory=list)

    @property
    def score_label(self) -> str:
        return f"{self.score}/{self.max_score}"

    def by_severity(self, severity: Severity) -> list[Finding]:
        return [f for f in self.findings if f.severity == severity]
