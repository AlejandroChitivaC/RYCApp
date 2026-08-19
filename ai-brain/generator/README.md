---
id: generator-readme
title: Generador AIKB
module: generator
layer: tooling
status: active
owner: architecture
generated: 2026-07-13
version: "1.0.0"
depends_on: []
related_entities: []
related_modules: []
tags: [generator]
---

# generator/

Scripts auxiliares para bootstrap/regeneración de la AIKB.

| Script | Propósito |
|--------|-----------|
| `export_metadata.py` | Regenera JSON en `11_METADATA/` |
| `validate_structure.py` | Valida estructura mínima |
| `REGENERATION_CHECKLIST.md` | Checklist post-cambio de código |
| `_gen_*.py` | Scripts históricos de bootstrap (opcionales) |

La fuente oficial son los `.md`/`.json` versionados bajo `ai-brain/`.
