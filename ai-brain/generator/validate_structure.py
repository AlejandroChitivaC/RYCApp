# -*- coding: utf-8 -*-
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
REQUIRED_DIRS = [
    "00_PROJECT", "01_ARCHITECTURE", "02_DOMAIN", "03_BACKEND", "04_FRONTEND",
    "05_DATABASE", "06_API", "07_SECURITY", "08_INTEGRATIONS", "09_TESTING",
    "10_DIAGRAMS", "11_METADATA", "generator",
]
REQUIRED_FILES = [
    "README.md",
    "00_PROJECT/PROJECT.md", "00_PROJECT/VISION.md", "00_PROJECT/ROADMAP.md",
    "00_PROJECT/GLOSSARY.md", "00_PROJECT/DECISIONS.md",
    "01_ARCHITECTURE/ARCHITECTURE.md", "01_ARCHITECTURE/MODULES.md",
    "01_ARCHITECTURE/DEPENDENCIES.md", "01_ARCHITECTURE/PATTERNS.md",
    "01_ARCHITECTURE/ANTI_PATTERNS.md", "01_ARCHITECTURE/CODING_GUIDELINES.md",
    "01_ARCHITECTURE/EXTENSION_GUIDE.md",
    "02_DOMAIN/DOMAIN_MODEL.md", "02_DOMAIN/AGGREGATES.md", "02_DOMAIN/ENTITIES.md",
    "02_DOMAIN/VALUE_OBJECTS.md", "02_DOMAIN/BUSINESS_RULES.md", "02_DOMAIN/WORKFLOWS.md",
    "02_DOMAIN/BOUNDED_CONTEXTS.md", "02_DOMAIN/USE_CASES.md", "02_DOMAIN/STATE_MACHINES.md",
    "08_INTEGRATIONS/SIIGO.md",
    "11_METADATA/llm-index.json", "11_METADATA/knowledge-graph.json",
    "11_METADATA/entities.json", "11_METADATA/modules.json", "11_METADATA/apis.json",
    "11_METADATA/business-rules.json", "11_METADATA/consistency-audit.json",
]

missing = []
for d in REQUIRED_DIRS:
    if not (ROOT / d).is_dir():
        missing.append("DIR " + d)
for f in REQUIRED_FILES:
    if not (ROOT / f).is_file():
        missing.append("FILE " + f)

if missing:
    print("FAIL — missing:")
    for m in missing:
        print(" -", m)
    sys.exit(1)
print("OK — AIKB structure valid")
print("root:", ROOT)
