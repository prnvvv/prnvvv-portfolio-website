"""Validates the knowledge files before they are ingested."""
from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from pathlib import Path

from app.rag.document_loader import find_item_list, list_json_files

SECRET_PATTERNS = [
    re.compile(r"gsk_[A-Za-z0-9]{10,}"),
    re.compile(r"sk-[A-Za-z0-9]{16,}"),
    re.compile(r"AKIA[0-9A-Z]{16}"),
    re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----"),
    re.compile(r"(?i)\b(api[_-]?key|password|secret|token)\s*[:=]\s*\S{6,}"),
]
PHONE_PATTERN = re.compile(r"\+\d{1,3}[\s-]?\d{4,5}[\s-]?\d{4,6}")
CONTROL_CHARS = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f]")
MAX_FILE_BYTES = 200_000


@dataclass
class ValidationReport:
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    files_checked: int = 0

    @property
    def ok(self) -> bool:
        return not self.errors


def validate_data_dir(data_dir: Path) -> ValidationReport:
    report = ValidationReport()
    if not data_dir.is_dir():
        report.errors.append(f"data directory not found: {data_dir}")
        return report

    project_ids: dict[str, str] = {}
    for path in list_json_files(data_dir):
        rel = path.relative_to(data_dir).as_posix()
        report.files_checked += 1
        if path.stat().st_size > MAX_FILE_BYTES:
            report.errors.append(f"{rel}: file larger than {MAX_FILE_BYTES} bytes")
            continue
        try:
            text = path.read_text(encoding="utf-8")
            raw = json.loads(text)
        except (UnicodeDecodeError, json.JSONDecodeError) as e:
            report.errors.append(f"{rel}: invalid JSON ({e})")
            continue
        if not isinstance(raw, dict):
            report.errors.append(f"{rel}: top-level value must be an object")
            continue

        if not isinstance(raw.get("category"), str) or not raw["category"].strip():
            report.errors.append(f"{rel}: missing required string field 'category'")
        if not isinstance(raw.get("source"), str) or not raw["source"].strip():
            report.errors.append(f"{rel}: missing required string field 'source'")
        if raw.get("document_mode") not in (None, "single", "per_item"):
            report.errors.append(f"{rel}: document_mode must be 'single' or 'per_item'")

        if CONTROL_CHARS.search(text):
            report.errors.append(f"{rel}: contains control characters")
        for pat in SECRET_PATTERNS:
            if pat.search(text):
                report.errors.append(f"{rel}: looks like it contains a secret or credential")
        if PHONE_PATTERN.search(text):
            report.warnings.append(f"{rel}: contains a phone-number-like value; confirm it is meant to be public")

        key, items = find_item_list(raw)
        if key:
            ids = [i.get("id") for i in items]
            if any(i is None for i in ids):
                report.errors.append(f"{rel}: every object in '{key}' needs an 'id'")
            elif len(set(ids)) != len(ids):
                report.errors.append(f"{rel}: duplicate ids inside '{key}'")
        if raw.get("category") == "projects" and not key:
            pid = raw.get("id")
            if not pid:
                report.errors.append(f"{rel}: project file needs an 'id'")
            elif pid in project_ids:
                report.errors.append(f"{rel}: project id '{pid}' duplicates {project_ids[pid]}")
            else:
                project_ids[pid] = rel
    if report.files_checked == 0:
        report.errors.append("no JSON files found")
    return report
