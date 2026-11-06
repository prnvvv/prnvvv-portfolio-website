"""Dense retrieval (ChromaDB) + project-entity lookup, producing reranked candidates."""
from __future__ import annotations

import re
from dataclasses import dataclass, field

from app.rag.reranker import Candidate, rerank
from app.rag.vector_store import VectorStore

MAX_SCAN = 400  # the corpus is small; scanning every vector keeps scores exact for all chunks


def _compact(s: str) -> str:
    return re.sub(r"[^a-z0-9]", "", s.lower())


@dataclass
class RetrievalResult:
    ranked: list[Candidate] = field(default_factory=list)
    entities: list[str] = field(default_factory=list)
    entity_doc_ids: set[str] = field(default_factory=set)

    @property
    def best_similarity(self) -> float:
        return max((c.sim for c in self.ranked), default=0.0)


class Retriever:
    def __init__(self, store: VectorStore):
        self.store = store
        self._alias_map: dict[str, tuple[str, str]] = {}
        self.refresh()

    def refresh(self) -> None:
        """Rebuild the project-name lookup from indexed documents (call after ingestion)."""
        alias_map: dict[str, tuple[str, str]] = {}
        for md in self.store.documents():
            name = md.get("project_name")
            if not name:
                continue
            for alias in {name, *md.get("aliases", [])}:
                c = _compact(alias)
                if len(c) >= 3:
                    alias_map[c] = (md["doc_id"], name)
        self._alias_map = alias_map

    def find_entities(self, text: str) -> list[tuple[str, str]]:
        """Project names mentioned in `text` (matches 1-3 token windows, so 'SSL RUL' == 'ssl-rul')."""
        toks = re.findall(r"[a-z0-9]+", text.lower())
        windows = {"".join(toks[i:i + n]) for n in (1, 2, 3) for i in range(len(toks) - n + 1)}
        found: dict[str, str] = {}
        for compact, (doc_id, name) in self._alias_map.items():
            if compact in windows:
                found[doc_id] = name
        return list(found.items())

    def entity_names(self, text: str) -> list[str]:
        return [name for _, name in self.find_entities(text)]

    def retrieve(self, query: str, intent_categories: set[str] | None = None,
                 entity_text: str | None = None) -> RetrievalResult:
        if not self.store.ready:
            return RetrievalResult()
        hits = self.store.search(query, MAX_SCAN)
        cands = [Candidate(h.text, h.score, h.metadata, h.vector_id) for h in hits]
        ents = self.find_entities(entity_text if entity_text is not None else query)
        doc_ids = {d for d, _ in ents}
        ranked = rerank(query, cands, intent_categories, doc_ids)
        return RetrievalResult(ranked, [n for _, n in ents], doc_ids)
