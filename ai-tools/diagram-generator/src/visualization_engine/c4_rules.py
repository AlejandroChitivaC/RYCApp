"""C4 Model purity rules — never mix levels in one diagram."""

from __future__ import annotations

from architecture_engine.models import ArchElement, ArchLevel, ElementKind

# Allowed kinds per C4 / architecture view
C4_ALLOWED_KINDS: dict[str, set[ElementKind]] = {
    "c4-context": {
        ElementKind.ACTOR,
        ElementKind.SYSTEM,
        ElementKind.EXTERNAL_SYSTEM,
    },
    "c4-container": {
        ElementKind.ACTOR,
        ElementKind.CONTAINER,
        ElementKind.EXTERNAL_SYSTEM,
    },
    "architecture": {
        ElementKind.ACTOR,
        ElementKind.SYSTEM,
        ElementKind.CONTAINER,
        ElementKind.EXTERNAL_SYSTEM,
    },
    "c4-component": {
        ElementKind.MODULE,
        ElementKind.SERVICE,
        ElementKind.COMPONENT,
        ElementKind.EXTERNAL_SYSTEM,
        ElementKind.CONTAINER,  # DB as dependency target only
    },
    "components": {
        ElementKind.MODULE,
        ElementKind.SERVICE,
        ElementKind.EXTERNAL_SYSTEM,
        ElementKind.CONTAINER,
    },
    "c4-code": {
        ElementKind.COMPONENT,
        ElementKind.SERVICE,
        ElementKind.REPOSITORY,
    },
    "code": {
        ElementKind.COMPONENT,
        ElementKind.SERVICE,
        ElementKind.REPOSITORY,
    },
    "domain": {ElementKind.DOMAIN_ENTITY},
    "database": {ElementKind.DATABASE_ENTITY},
    "dependencies": {
        ElementKind.CONTAINER,
        ElementKind.EXTERNAL_SYSTEM,
        ElementKind.MODULE,
    },
}


class C4Rules:
    """Enforce C4 level separation and enterprise view constraints."""

    def allowed_kinds(self, view: str) -> set[ElementKind] | None:
        return C4_ALLOWED_KINDS.get(view)

    def filter_elements(self, view: str, elements: list[ArchElement]) -> list[ArchElement]:
        allowed = self.allowed_kinds(view)
        if allowed is None:
            return list(elements)
        filtered = [element for element in elements if element.kind in allowed]

        # C4 Context: never include modules/classes
        if view == "c4-context":
            filtered = [
                e
                for e in filtered
                if e.kind
                in {ElementKind.ACTOR, ElementKind.SYSTEM, ElementKind.EXTERNAL_SYSTEM}
            ]

        # C4 Container: applications/services/data stores — not modules
        if view in {"c4-container", "architecture"}:
            filtered = [
                e
                for e in filtered
                if e.kind
                in {
                    ElementKind.ACTOR,
                    ElementKind.SYSTEM,
                    ElementKind.CONTAINER,
                    ElementKind.EXTERNAL_SYSTEM,
                }
            ]

        # C4 Component: modules internos; containers only if DB
        if view in {"c4-component", "components"}:
            filtered = [
                e
                for e in filtered
                if e.kind in {ElementKind.MODULE, ElementKind.SERVICE, ElementKind.EXTERNAL_SYSTEM}
                or (e.kind == ElementKind.CONTAINER and e.id.endswith(":db"))
            ]

        # Code level on demand only — caller gates generation
        if view in {"c4-code", "code"}:
            filtered = [
                e
                for e in filtered
                if e.architectural_level in {ArchLevel.CODE, ArchLevel.COMPONENT}
                and e.kind
                in {
                    ElementKind.COMPONENT,
                    ElementKind.SERVICE,
                    ElementKind.REPOSITORY,
                }
            ]

        return filtered

    def validate_purity(self, view: str, elements: list[ArchElement]) -> list[str]:
        warnings: list[str] = []
        allowed = self.allowed_kinds(view)
        if not allowed:
            return warnings
        for element in elements:
            if element.kind not in allowed:
                warnings.append(
                    f"C4 purity: elemento '{element.name}' ({element.kind.value}) "
                    f"no pertenece a la vista '{view}'"
                )
        if view == "c4-context" and any(
            e.kind in {ElementKind.MODULE, ElementKind.COMPONENT, ElementKind.SERVICE}
            for e in elements
        ):
            warnings.append("C4 Context no debe mezclar módulos ni clases")
        return warnings
