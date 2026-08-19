"""Parse AIKB Markdown tables into structured enrichment data."""

from __future__ import annotations

import re
from typing import Any

TABLE_ROW = re.compile(r"^\|(.+)\|$", re.MULTILINE)


def parse_markdown_tables(body: str) -> list[list[list[str]]]:
    """Return list of tables; each table is a list of row cell lists."""
    tables: list[list[list[str]]] = []
    current: list[list[str]] = []
    for line in body.splitlines():
        stripped = line.strip()
        if not stripped.startswith("|"):
            if current:
                tables.append(_clean_table(current))
                current = []
            continue
        cells = [cell.strip() for cell in stripped.strip("|").split("|")]
        if cells and all(re.fullmatch(r":?-{3,}:?", c.replace(" ", "")) for c in cells):
            continue  # separator
        current.append(cells)
    if current:
        tables.append(_clean_table(current))
    return tables


def _clean_table(rows: list[list[str]]) -> list[list[str]]:
    if not rows:
        return rows
    width = max(len(row) for row in rows)
    return [row + [""] * (width - len(row)) for row in rows]


def table_as_dicts(table: list[list[str]]) -> list[dict[str, str]]:
    if len(table) < 2:
        return []
    headers = [h.lower().strip() for h in table[0]]
    records: list[dict[str, str]] = []
    for row in table[1:]:
        record = {
            headers[i]: row[i].strip()
            for i in range(min(len(headers), len(row)))
            if headers[i]
        }
        if any(record.values()):
            records.append(record)
    return records


def first_matching_table(
    body: str,
    required_headers: set[str],
) -> list[dict[str, str]]:
    for table in parse_markdown_tables(body):
        records = table_as_dicts(table)
        if not records:
            continue
        headers = set(records[0].keys())
        if required_headers.issubset(headers):
            return records
    return []


def strip_md(value: str) -> str:
    """Remove light Markdown formatting from cell text."""
    text = value.strip()
    text = re.sub(r"`([^`]+)`", r"\1", text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"\1", text)
    text = re.sub(r"\*([^*]+)\*", r"\1", text)
    return text.strip()


def extract_section(body: str, heading: str) -> str:
    pattern = re.compile(
        rf"^##\s+{re.escape(heading)}\s*$([\s\S]*?)(?=^##\s+|\Z)",
        re.MULTILINE | re.IGNORECASE,
    )
    match = pattern.search(body)
    return match.group(1).strip() if match else ""


def as_evidence(doc_path: str, fragment: str | None = None) -> list[str]:
    if fragment:
        return [f"{doc_path}::{fragment}"]
    return [doc_path]
