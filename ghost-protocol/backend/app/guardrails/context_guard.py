"""Decides whether the retrieved evidence is relevant and sufficient, and builds the prompt context.

Retrieved text is treated as untrusted data: chunks that contain instruction-like content are
dropped before they can reach the LLM.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass, field

from app.core.logging import log_event
from app.guardrails.prompt_injection_detector import scan_untrusted_document
from app.rag.reranker import Candidate

logger = logging.getLogger(__name__)

RELATIVE_SCORE_MARGIN = 0.22  # drop chunks far weaker than the best one


@dataclass
class ContextDecision:
    sufficient: bool
    chunks: list[Candidate] = field(default_factory=list)
    context_text: str = ""
    reason: str = ""


def _is_relevant(c: Candidate, threshold: float, relax_topic: bool) -> bool:
    if c.entity_match:
        return True
    # the classifier already identified a specific topic (education, skills ...): documents of that category
    # are topically relevant even when the phrasing embeds poorly ("Where did he study?" vs a degree table)
    if relax_topic and c.category_match and c.sim >= threshold * 0.6:
        return True
    if c.sim >= threshold:
        return True
    # an explicit lexical match with the document title/aliases is strong evidence on its own
    if c.title_overlap >= 0.5 and c.sim >= threshold * 0.6:
        return True
    # short keyword questions ("Does he know PyTorch?") embed poorly against long chunks; a strong
    # verbatim term match plus a minimum semantic floor is accepted as evidence.
    return c.text_overlap >= 0.5 and c.sim >= 0.2


def evaluate_context(
    ranked: list[Candidate],
    *,
    threshold: float,
    top_k: int,
    max_context_chars: int,
    relax_topic: bool = False,
) -> ContextDecision:
    if not ranked:
        return ContextDecision(False, reason="no_candidates")

    relevant = [c for c in ranked if _is_relevant(c, threshold, relax_topic)]
    if not relevant:
        return ContextDecision(False, reason=f"below_threshold(best={ranked[0].sim:.2f})")

    best = relevant[0].score
    kept: list[Candidate] = []
    for c in relevant:
        if best - c.score > RELATIVE_SCORE_MARGIN:
            continue
        if scan_untrusted_document(c.text).detected:
            log_event(logger, "dropped retrieved chunk with instruction-like content",
                      level=logging.WARNING, doc=c.metadata.get("doc_id"))
            continue
        kept.append(c)
        if len(kept) >= top_k:
            break
    if not kept:
        return ContextDecision(False, reason="all_chunks_rejected")

    blocks: list[str] = []
    used: list[Candidate] = []
    total = 0
    for i, c in enumerate(kept, 1):
        block = f"[{i}] ({c.metadata.get('category')} / {c.metadata.get('source_file')})\n{c.text}"
        if total + len(block) > max_context_chars:
            if not used:  # always keep at least one (truncated) block
                block = block[:max_context_chars]
            else:
                break
        blocks.append(block)
        used.append(c)
        total += len(block) + 2
    return ContextDecision(True, used, "\n\n".join(blocks), "ok")
