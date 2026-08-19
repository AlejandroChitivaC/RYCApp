---
id: aikb-readme
title: AI Engineering Knowledge Base — Índice
module: ai-brain
layer: knowledge
status: active
owner: architecture
generated: 2026-07-13
version: "1.0.0"
depends_on: []
related_entities: []
related_modules: []
tags: [aikb, index, docs-as-code]
---

# AI Engineering Knowledge Base (AIKB)

Fuente oficial de conocimiento del monorepo **PG2_RYCApp** (R&C Transportes / RYCApp).

Diseñada para humanos y agentes de IA. Toda afirmación se deriva del código fuente existente al momento de generación. Lo no deducible se marca como **Pendiente de definición funcional**.

## Principios

- Docs as Code / Knowledge as Code / Architecture as Code
- C4, Arc42, ADR, Diátaxis
- Clean Architecture + Hexagonal (backend)
- Feature-sliced ligera (frontend)
- Versionable con Git; regenerable vía `generator/`

## Mapa de carpetas

| Carpeta | Contenido |
|---------|-----------|
| [00_PROJECT](00_PROJECT/) | Visión, roadmap, glosario, ADRs |
| [01_ARCHITECTURE](01_ARCHITECTURE/) | Arquitectura, módulos, patrones, extensibilidad |
| [02_DOMAIN](02_DOMAIN/) | Modelo de dominio, reglas, casos de uso |
| [03_BACKEND](03_BACKEND/) | Un documento por módulo backend |
| [04_FRONTEND](04_FRONTEND/) | SPA, features, stores, flujos |
| [05_DATABASE](05_DATABASE/) | Modelo físico/lógico Flyway |
| [06_API](06_API/) | Catálogo de endpoints REST |
| [07_SECURITY](07_SECURITY/) | JWT, roles, authn/authz |
| [08_INTEGRATIONS](08_INTEGRATIONS/) | Siigo y otras integraciones |
| [09_TESTING](09_TESTING/) | Estrategia y estado real de pruebas |
| [10_DIAGRAMS](10_DIAGRAMS/) | PlantUML/Mermaid (sin imágenes) |
| [11_METADATA](11_METADATA/) | JSON indexable por LLM + knowledge graph |
| [generator](generator/) | Scripts de regeneración / checklist |

## Cómo usar (LLM)

1. Leer `11_METADATA/llm-index.json` para localizar artefactos.
2. Seguir `depends_on` / `related_*` del front matter YAML.
3. Consultar `11_METADATA/knowledge-graph.json` para relaciones.
4. No reinventar arquitectura: respetar `01_ARCHITECTURE/EXTENSION_GUIDE.md` y ADRs.

## Regeneración

Ver `generator/README.md`. Tras cambios estructurales en `backend/` o `frontend/`, actualizar los documentos afectados listados en cada archivo (`when_to_update` / sección Evolución).

## Auditoría

Ver `11_METADATA/consistency-audit.json` — última auditoría cruzada de consistencia.
