"""Coupling analyzer — module dependency fan-in / fan-out."""

from __future__ import annotations

from collections import defaultdict

from architecture_engine.analyzers.models import CouplingMetrics, Finding, Severity
from architecture_engine.models import ArchitectureModel, ElementKind


class CouplingAnalyzer:
    """Measure dependencies between modules from ArchitectureModel."""

    HIGH_EFFERENT = 6
    HIGH_AFFERENT = 8

    def analyze(
        self,
        model: ArchitectureModel,
    ) -> tuple[list[CouplingMetrics], list[Finding]]:
        modules = {
            m.id: m
            for m in model.modules
            if m.kind == ElementKind.MODULE and m.parent_id == "container:api"
        }
        # Graph: module → module via shared entity contexts / component wiring
        # Prefer explicit module→external and infer coupling via bounded context spill
        outgoing: dict[str, set[str]] = defaultdict(set)
        incoming: dict[str, set[str]] = defaultdict(set)

        # Context map coupling: modules in different contexts linked by domain rels
        entity_to_ctx = {
            e.name: e.bounded_context
            for e in model.domain_entities
            if e.bounded_context
        }
        module_by_ctx: dict[str, list[str]] = defaultdict(list)
        for mid, module in modules.items():
            if module.bounded_context:
                module_by_ctx[module.bounded_context].append(mid)

        for relation in model.relationships:
            if relation.architectural_level.value != "domain":
                continue
            src = relation.source_id.removeprefix("entity:")
            dst = relation.target_id.removeprefix("entity:")
            ctx_a = entity_to_ctx.get(src)
            ctx_b = entity_to_ctx.get(dst)
            if not ctx_a or not ctx_b or ctx_a == ctx_b:
                continue
            for left in module_by_ctx.get(ctx_a, []):
                for right in module_by_ctx.get(ctx_b, []):
                    if left != right:
                        outgoing[left].add(right)
                        incoming[right].add(left)

        # Module → external / db edges
        for relation in model.relationships:
            if not relation.source_id.startswith("module:"):
                continue
            if relation.target_id.startswith("module:"):
                outgoing[relation.source_id].add(relation.target_id)
                incoming[relation.target_id].add(relation.source_id)
            elif relation.target_id.startswith("external:"):
                # count external as efferent dependency sink
                outgoing[relation.source_id].add(relation.target_id)

        metrics: list[CouplingMetrics] = []
        findings: list[Finding] = []
        for mid, module in modules.items():
            ca = len(incoming.get(mid, set()))
            ce = len(outgoing.get(mid, set()))
            instability = ce / (ca + ce) if (ca + ce) else 0.0
            metrics.append(
                CouplingMetrics(
                    module_id=module.name,
                    afferent=ca,
                    efferent=ce,
                    instability=round(instability, 3),
                )
            )
            if ce >= self.HIGH_EFFERENT:
                findings.append(
                    Finding(
                        id=f"CPL-EFF-{module.name}",
                        analyzer="coupling",
                        severity=Severity.MEDIUM,
                        title=f"Alto acoplamiento eferente en '{module.name}'",
                        detail=(
                            f"El módulo {module.name} depende de {ce} destinos "
                            f"(instability={instability:.2f})."
                        ),
                        evidence=["ArchitectureModel relationships", "bounded contexts"],
                        recommendation=(
                            "Extraer adaptadores / anti-corruption layers y "
                            "reducir dependencias cruzadas entre contextos."
                        ),
                        metadata={"efferent": ce, "afferent": ca},
                    )
                )
            if ca >= self.HIGH_AFFERENT:
                findings.append(
                    Finding(
                        id=f"CPL-AFF-{module.name}",
                        analyzer="coupling",
                        severity=Severity.MEDIUM,
                        title=f"Alto acoplamiento aferente en '{module.name}'",
                        detail=f"{ca} módulos dependen de {module.name}.",
                        evidence=["ArchitectureModel relationships"],
                        recommendation=(
                            "Estabilizar contrato público del módulo y evitar "
                            "que se convierta en shared kernel implícito."
                        ),
                        metadata={"afferent": ca},
                    )
                )

        # Hub detection: Usuario shared kernel called out by AIKB
        if any(e.name == "Usuario" for e in model.domain_entities):
            findings.append(
                Finding(
                    id="CPL-SHARED-Usuario",
                    analyzer="coupling",
                    severity=Severity.LOW,
                    title="Shared kernel detectado: Usuario",
                    detail=(
                        "AIKB declara Usuario/Rol como shared kernel entre contextos "
                        "(Identity ──shared──► Operations, Costs, Tickets, Catalog)."
                    ),
                    evidence=["02_DOMAIN/BOUNDED_CONTEXTS.md"],
                    recommendation=(
                        "Documentar el shared kernel formalmente y limitar "
                        "expansión de campos transversales en Usuario."
                    ),
                )
            )

        metrics.sort(key=lambda m: m.efferent + m.afferent, reverse=True)
        return metrics, findings
