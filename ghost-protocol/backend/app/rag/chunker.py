"""Splits documents into retrieval chunks on paragraph / line / sentence boundaries.

Every chunk repeats the two-line document header ("[Category] Title" + subject) so a chunk
is still meaningful, and retrievable, on its own.
"""
from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Any

from app.rag.document_loader import Document

SENTENCE_SPLIT = re.compile(r"(?<=[.!?])\s+")


@dataclass
class Chunk:
    chunk_id: str
    text: str
    metadata: dict[str, Any]


def _hard_wrap(text: str, limit: int) -> list[str]:
    return [text[i:i + limit] for i in range(0, len(text), limit)]


def _split_units(para: str, limit: int) -> list[str]:
    """Break a paragraph into units no longer than `limit`, preferring line then sentence breaks."""
    if len(para) <= limit:
        return [para]
    units: list[str] = []
    for line in para.split("\n"):
        if len(line) <= limit:
            units.append(line)
            continue
        cur = ""
        for sent in SENTENCE_SPLIT.split(line):
            if len(sent) > limit:
                if cur:
                    units.append(cur)
                    cur = ""
                units.extend(_hard_wrap(sent, limit))
            elif cur and len(cur) + 1 + len(sent) > limit:
                units.append(cur)
                cur = sent
            else:
                cur = f"{cur} {sent}".strip()
        if cur:
            units.append(cur)
    return units


def chunk_document(doc: Document, max_chars: int = 900) -> list[Chunk]:
    lines = doc.text.split("\n")
    header = "\n".join(lines[:2])
    body = "\n".join(lines[2:]).strip("\n")

    if len(doc.text) <= max_chars:
        pieces = [doc.text]
    else:
        budget = max(max_chars - len(header) - 1, 120)
        pieces: list[str] = []
        cur = ""
        for para in body.split("\n\n"):
            for unit in _split_units(para, budget):
                joiner = "\n\n" if cur and unit is para else "\n" if cur else ""
                if cur and len(cur) + len(joiner) + len(unit) > budget:
                    pieces.append(f"{header}\n{cur}")
                    cur = unit
                else:
                    cur = f"{cur}{joiner}{unit}"
        if cur.strip():
            pieces.append(f"{header}\n{cur}")

    total = len(pieces)
    return [
        Chunk(f"{doc.doc_id}#{i}", text.strip(), {**doc.metadata, "chunk_index": i, "chunk_total": total})
        for i, text in enumerate(pieces)
    ]
