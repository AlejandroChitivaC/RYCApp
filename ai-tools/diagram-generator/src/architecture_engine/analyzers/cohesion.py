"""Cohesion analyzer — detect genuine responsibility scatter (not hexagonal slices)."""

from __future__ import annotations

import re

from architecture_engine.analyzers.models import Finding, Severity
from architecture_engine.models import ArchitectureModel

HEX_SLICE_PREFIXES = ("API:", "App:", "Out:", "API :", "App :", "Out :")


class CohesionAnalyzer:
    """
    Flag modules/services with scattered responsibilities.

    A normal vertical slice (Controller + Service + Repository) is NOT
    treated as low cohesion — that is expected in Clean/Hexagonal modules.
    """

    def analyze(self, model: ArchitectureModel) -> list[Finding]:
        findings: list[Finding] = []

        for module in model.modules:
            meta = module.metadata or {}
            resp = module.responsibility or ""

            # Count only clauses that are NOT the standard hexagonal trio
            clauses = [c.strip() for c in re.split(r"[;]", resp) if c.strip()]
            non_hex = [
                c
                for c in clauses
                if not any(c.startswith(prefix) for prefix in HEX_SLICE_PREFIXES)
            ]
            # Extra business concerns beyond the vertical slice
            if len(non_hex) >= 2:
                findings.append(
                    Finding(
                        id=f"COH-MOD-{module.name}",
                        analyzer="cohesion",
                        severity=Severity.MEDIUM,
                        title=f"Responsabilidades adicionales en '{module.name}'",
                        detail=f"Más allá del slice hexagonal: {', '.join(non_hex)}",
                        evidence=["01_ARCHITECTURE/MODULES.md", "ArchitectureModel"],
                        recommendation=(
                            "Evaluar si las preocupaciones extra merecen "
                            "un módulo o servicio separado dentro del contexto."
                        ),
                        metadata={"extra_clauses": non_hex},
                    )
                )

            port_in = str(meta.get("port_in") or "")
            if module.name == "auth" and (
                "ausente" in port_in.lower() or port_in in {"", "*(ausente)*"}
            ):
                findings.append(
                    Finding(
                        id="COH-AUTH-NO-PORT",
                        analyzer="cohesion",
                        severity=Severity.LOW,
                        title="Auth sin port-in (excepción documentada)",
                        detail=(
                            "AIKB: AuthController → AuthService → JPA repos "
                            "(sin UseCase port-in)."
                        ),
                        evidence=["01_ARCHITECTURE/ARCHITECTURE.md", "MODULES.md"],
                        recommendation=(
                            "Considerar introducir AuthUseCase para alinear Auth "
                            "con el resto de módulos hexagonales."
                        ),
                    )
                )

        if model.style and "Clean" in (model.style or ""):
            findings.append(
                Finding(
                    id="COH-ANEMIC-DOMAIN",
                    analyzer="cohesion",
                    severity=Severity.LOW,
                    title="Dominio anémico (reglas en application)",
                    detail=(
                        "AIKB documenta dominio anémico sin aggregates ricos ni "
                        "domain events; la cohesión de negocio vive en Services."
                    ),
                    evidence=[
                        "01_ARCHITECTURE/ARCHITECTURE.md",
                        "02_DOMAIN/DOMAIN_MODEL.md",
                    ],
                    recommendation=(
                        "Si la complejidad crece, mover invariantes críticas a "
                        "domain services / aggregates ricos."
                    ),
                )
            )

        return findings
