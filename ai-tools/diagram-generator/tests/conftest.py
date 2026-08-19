"""Pytest configuration."""

from __future__ import annotations

import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

FIXTURE_AIKB = Path(__file__).resolve().parent / "fixtures" / "ai-brain"


@pytest.fixture
def fixture_aikb() -> Path:
    return FIXTURE_AIKB


@pytest.fixture
def sample_config() -> dict:
    return {
        "project": {"name": "FixtureApp", "full_name": "Fixture App"},
        "paths": {"ai_brain": str(FIXTURE_AIKB), "output": "./output"},
        "generators": {
            "drawio": True,
            "mermaid": True,
            "plantuml": True,
            "c4": True,
        },
        "styles": {"drawio": {}},
        "logging": {"level": "WARNING"},
    }
