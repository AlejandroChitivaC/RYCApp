---
id: generator-checklist
title: Checklist de regeneración
module: generator
layer: tooling
status: active
owner: architecture
generated: 2026-07-13
version: "1.0.0"
depends_on: []
related_entities: []
related_modules: []
tags: [checklist]
---

# REGENERATION_CHECKLIST.md

| Cambio en código | Docs AIKB a tocar |
|------------------|-------------------|
| Nuevo Controller/endpoint | `06_API/*`, `apis.json` |
| Nueva entidad domain | `02_DOMAIN/*`, `entities.json`, `relationships.json` |
| Nueva regla en Service | `BUSINESS_RULES.md`, `business-rules.json` |
| Nueva migración Flyway | `05_DATABASE/*`, `database-er.md` |
| Nuevo feature frontend | `04_FRONTEND/*`, `modules.json` |
| Cambio Security/roles | `07_SECURITY/*` |
| Nueva integración | `08_INTEGRATIONS/*`, `integrations.json` |
| ADR / arquitectura | `DECISIONS.md`, `ARCHITECTURE.md` |

Luego:

```bash
python ai-brain/generator/export_metadata.py
python ai-brain/generator/validate_structure.py
```

Revisar `11_METADATA/consistency-audit.json`.
