"""Reads the JSON knowledge files and turns them into retrieval documents.

Conventions (see backend/README.md):
* every file has a top-level ``category`` and ``source``;
* a file is either a single document, or contains one list of objects which becomes
  one document per object (``document_mode: "per_item"``, the default when a list is found);
* ``document_mode: "single"`` keeps a list-bearing file as ONE document (better for
  "list everything" questions); the chunker splits it on item boundaries.
"""
from __future__ import annotations

import hashlib
import json
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

EXCLUDED_FILES = {"metadata.json"}
SKIP_KEYS = {"category", "subcategory", "source", "document_mode", "id", "portfolio_id"}
TITLE_KEYS = ("name", "full_title", "title", "position", "institution", "question", "id")
URL_RE = re.compile(r"https?://[^\s\"')]+")

CATEGORY_LABELS = {
    "personal_profile": "Personal profile",
    "contact": "Contact",
    "education": "Education",
    "experience": "Experience",
    "skills": "Skills",
    "projects": "Project",
    "research": "Research",
    "achievements": "Achievements",
    "portfolio_general": "Portfolio",
    "faq": "FAQ",
}


@dataclass
class Document:
    doc_id: str
    title: str
    text: str
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class SourceFile:
    rel_path: str
    sha256: str
    documents: list[Document]


def list_json_files(data_dir: Path) -> list[Path]:
    return sorted(
        p for p in data_dir.rglob("*.json") if p.is_file() and p.name not in EXCLUDED_FILES
    )


def file_sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def _label(key: str) -> str:
    return key.replace("_", " ").strip().capitalize()


def _scalar(v: Any) -> str:
    if isinstance(v, bool):
        return "yes" if v else "no"
    return str(v)


def _empty(v: Any) -> bool:
    return v is None or v == "" or v == [] or v == {}


def _render_value(key: str, value: Any, indent: int = 0) -> list[str]:
    pad = "  " * indent
    if _empty(value):
        return []
    if isinstance(value, dict):
        lines = [f"{pad}{_label(key)}:"]
        for k, v in value.items():
            lines.extend(_render_value(k, v, indent + 1))
        return lines
    if isinstance(value, list):
        if all(not isinstance(x, (dict, list)) for x in value):
            return [f"{pad}{_label(key)}: " + "; ".join(_scalar(x) for x in value)]
        lines = [f"{pad}{_label(key)}:"]
        for x in value:
            if isinstance(x, dict):
                head = x.get("name") or x.get("title")
                rest = [(k, v) for k, v in x.items() if k not in ("name", "title") and not _empty(v)]
                parts = ", ".join(
                    f"{_label(k).lower()} "
                    f"{'; '.join(map(str, v)) if isinstance(v, list) else _scalar(v)}"
                    for k, v in rest
                )
                lines.append(f"{pad}  - {head}" + (f" ({parts})" if parts else ""))
            else:
                lines.append(f"{pad}  - {_scalar(x)}")
        return lines
    return [f"{pad}{_label(key)}: {_scalar(value)}"]


def _title_of(obj: dict, fallback: str) -> str:
    for k in TITLE_KEYS:
        v = obj.get(k)
        if isinstance(v, str) and v.strip():
            return v.strip()
    return fallback


def _urls(obj: Any) -> list[str]:
    found: list[str] = []
    for m in URL_RE.findall(json.dumps(obj, ensure_ascii=False)):
        m = m.rstrip(",.\\")
        if m not in found:
            found.append(m)
    return found


def _aliases(obj: dict, title: str) -> list[str]:
    out = {title.lower()}
    for k in ("name", "full_title", "id", "handle"):
        v = obj.get(k)
        if isinstance(v, str):
            out.add(v.lower().replace("_", " "))
            if " — " in v:
                out.add(v.split(" — ")[0].lower())
    return sorted(a for a in out if len(a) >= 3)


def find_item_list(raw: dict) -> tuple[str | None, list[dict]]:
    for k, v in raw.items():
        if isinstance(v, list) and v and all(isinstance(x, dict) for x in v):
            return k, v
    return None, []


def _header_lines(raw: dict, exclude: set[str]) -> list[str]:
    lines: list[str] = []
    for k, v in raw.items():
        if k in SKIP_KEYS or k in exclude or isinstance(v, (list, dict)):
            continue
        lines.extend(_render_value(k, v))
    return lines


def _item_lines(item: dict, skip: set[str] | None = None) -> list[str]:
    lines: list[str] = []
    for k, v in item.items():
        if k in SKIP_KEYS or (skip and k in skip):
            continue
        lines.extend(_render_value(k, v))
    return lines


def _file_title(raw: dict, subcategory: Any, stem: str) -> str:
    fallback = str(subcategory).replace("_", " ").title() if subcategory else stem.replace("_", " ").title()
    return _title_of(raw, fallback)


def load_file(path: Path, data_dir: Path) -> SourceFile:
    rel = path.relative_to(data_dir).as_posix()
    raw_bytes = path.read_bytes()
    raw = json.loads(raw_bytes.decode("utf-8"))
    if not isinstance(raw, dict):
        raise ValueError(f"{rel}: top-level JSON value must be an object")
    sha = hashlib.sha256(raw_bytes).hexdigest()

    category = str(raw.get("category", "unknown"))
    subcategory = raw.get("subcategory")
    label = CATEGORY_LABELS.get(category, category.replace("_", " ").title())
    stem = Path(rel).stem
    list_key, items = find_item_list(raw)
    mode = raw.get("document_mode") or ("per_item" if items else "single")

    def meta(obj: dict, title: str, doc_id: str, url_source: Any) -> dict[str, Any]:
        m: dict[str, Any] = {
            "category": category,
            "subcategory": subcategory,
            "title": title,
            "doc_id": doc_id,
            "source_file": path.name,
            "rel_path": rel,
            "urls": _urls(url_source),
            "aliases": _aliases(obj, title),
            "source": raw.get("source"),
        }
        if category == "projects" and isinstance(obj.get("name"), str):
            m["project_name"] = obj["name"]
        return m

    docs: list[Document] = []
    if items and mode == "per_item":
        header = _header_lines(raw, {list_key})
        for i, item in enumerate(items):
            iid = str(item.get("id") or i)
            title = _title_of(item, f"{stem} {i + 1}")
            doc_id = f"{rel}::{iid}"
            body = [f"[{label}] {title}", "Subject: Prannavakhanth A."] + header + _item_lines(item)
            docs.append(Document(doc_id, title, "\n".join(body), meta(item, title, doc_id, item)))
    elif items:
        title = _file_title(raw, subcategory, stem)
        doc_id = f"{rel}::all"
        blocks = ["\n".join([f"[{label}] {title}", "Subject: Prannavakhanth A."] + _header_lines(raw, {list_key}))]
        for item in items:
            ititle = _title_of(item, "")
            skip = set(TITLE_KEYS) if ititle else None
            blocks.append("\n".join(([f"- {ititle}"] if ititle else []) + ["  " + ln for ln in _item_lines(item, skip)]))
        extra: list[str] = []
        for k, v in raw.items():
            if k in SKIP_KEYS or k == list_key or not isinstance(v, (list, dict)):
                continue
            extra.extend(_render_value(k, v))
        if extra:
            blocks.append("\n".join(extra))
        docs.append(Document(doc_id, title, "\n\n".join(blocks), meta(raw, title, doc_id, raw)))
    else:
        title = _file_title(raw, subcategory, stem)
        doc_id = f"{rel}::{raw.get('id') or 'main'}"
        lines = [f"[{label}] {title}", "Subject: Prannavakhanth A."]
        for k, v in raw.items():
            if k not in SKIP_KEYS:
                lines.extend(_render_value(k, v))
        docs.append(Document(doc_id, title, "\n".join(lines), meta(raw, title, doc_id, raw)))
    return SourceFile(rel, sha, docs)


def load_all(data_dir: Path) -> list[SourceFile]:
    return [load_file(p, data_dir) for p in list_json_files(data_dir)]
