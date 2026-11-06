"""Validates the model's answer before it is returned to a visitor.

Deterministic checks only (no second LLM call): leakage, identity breaks, unsafe markup,
and *grounding* - numbers, URLs, e-mail addresses and technology-like names must appear in the
retrieved context (or in the visitor's question).
"""
from __future__ import annotations

import re
from dataclasses import dataclass

from app.rag.reranker import tokens

MAX_ANSWER_CHARS = 3500

LEAK_PATTERNS = [
    re.compile(r"gsk_[A-Za-z0-9]{8,}|sk-[A-Za-z0-9]{16,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----"),
    re.compile(r"\b(?:GROQ_API_KEY|GROQ_MODEL|ADMIN_TOKEN|ALLOWED_ORIGINS|FAISS_INDEX_PATH|FAISS_METADATA_PATH|EMBEDDING_MODEL|SIMILARITY_THRESHOLD)\b"),
    re.compile(r"(?i)\b(?:system\s+prompt|system\s+instructions?|hidden\s+instructions?|my\s+(?:initial\s+)?instructions|my\s+rules|my\s+programming|developer\s+message)\b"),
    re.compile(r"(?i)only\s+responsibility\s+is\s+to\s+answer|not\s+a\s+general-purpose\s+ai\s+assistant"),
    re.compile(r"(?i)\bNOT_IN_PORTFOLIO\b"),
]
IDENTITY_BREAKS = [
    re.compile(r"(?i)\bas\s+an?\s+(?:ai\s+)?language\s+model\b"),
    re.compile(r"(?i)\bi(?:'m|\s+am)\s+(?:now\s+)?(?:chatgpt|gpt|dan|gemini|claude|llama|an?\s+unrestricted)\b"),
    re.compile(r"(?i)\b(?:developer|jailbreak|dan)\s+mode\b"),
    re.compile(r"(?i)\bi\s+(?:can|will)\s+(?:help|assist)\s+(?:you\s+)?with\s+(?:anything|any\s+topic|any\s+question)\b"),
]
UNSAFE_MARKUP = re.compile(r"```|<\s*/?\s*(?:script|iframe|img|object|embed|style|svg|form|input|a)\b|!\[[^\]]*\]\(|javascript:|data:text/html|on\w+\s*=", re.I)
URL_RE = re.compile(r"https?://[^\s)\]>\"']+", re.I)
EMAIL_RE = re.compile(r"[\w.+\-]+@[\w\-]+\.[\w.\-]+")
NUMBER_RE = re.compile(r"(?<![\w.])\d[\d,]*(?:\.\d+)?%?")
# technology-looking tokens: CamelCase (TensorFlow), ALLCAPS (AWS), containing digits (YOLOv8, S3), symbols (C++)
TECH_TOKEN = re.compile(r"\b(?:[A-Z][a-z]+[A-Z][A-Za-z0-9]*|[A-Z]{2,}[A-Za-z0-9]*|[A-Za-z]+[0-9]+[A-Za-z0-9]*|[A-Z][A-Za-z]*\+\+|[A-Z][a-z]+\.js)\b")
CAPITALISED = re.compile(r"(?<![.!?]\s)(?<!^)(?<!\n)(?<![*\-•]\s)\b[A-Z][a-z]{3,}\b")
SAFE_CAPS = {
    "Prannavakhanth", "He", "His", "The", "This", "These", "That", "They", "However", "Additionally", "Also", "Here",
    "Currently", "Overall", "Based", "While", "Both", "Each", "Some", "Other", "Several", "Many", "Most", "Please",
    "January", "February", "March", "April", "June", "July", "August", "September", "October", "November", "December",
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
    "Markdown", "AI", "ML", "AM", "PM",
    # section-heading style words models commonly bold or capitalise
    "Projects", "Project", "Skills", "Education", "Experience", "Leadership", "Research", "Achievements", "Awards",
    "Contact", "Overview", "Summary", "Background", "Technologies", "Features", "Highlights", "Details", "Links",
    "Note", "Notably", "Specifically", "Furthermore", "Moreover", "Additionally", "Finally", "Together", "Beyond",
    "Hackathon", "Hackathons", "Patent", "Patents", "Intern", "Internship", "Certifications", "Languages",
    "Frameworks", "Tools", "Status", "Year", "Role", "Roles", "Team", "Github", "Linkedin", "Email",
}


@dataclass
class OutputCheck:
    ok: bool
    reason: str = ""


def _digits(s: str) -> str:
    return re.sub(r"[^\d.]", "", s).strip(".")


def validate_output(answer: str, *, context: str, question: str, vocabulary=None) -> OutputCheck:
    """`vocabulary`: lower-cased words that occur anywhere in the knowledge base. Plain capitalised words may come
    from it (paraphrase tolerance); technology-like tokens, numbers, URLs and e-mails must come from the context."""
    text = (answer or "").strip()
    if not text:
        return OutputCheck(False, "empty")
    if len(text) > MAX_ANSWER_CHARS:
        return OutputCheck(False, "too_long")
    for p in LEAK_PATTERNS:
        if p.search(text):
            return OutputCheck(False, "leak")
    for p in IDENTITY_BREAKS:
        if p.search(text):
            return OutputCheck(False, "identity_break")
    if UNSAFE_MARKUP.search(text):
        return OutputCheck(False, "unsafe_markup")

    ctx = context.lower()
    q = question.lower()
    allowed_blob = ctx + "\n" + q
    ctx_numbers = {_digits(n) for n in NUMBER_RE.findall(allowed_blob)}
    ctx_compact = re.sub(r"[\s,]", "", allowed_blob)

    for url in URL_RE.findall(text):
        if url.rstrip(".,;").lower() not in ctx:
            return OutputCheck(False, "unsupported_url")
    for mail in EMAIL_RE.findall(text):
        if mail.lower() not in ctx:
            return OutputCheck(False, "unsupported_email")

    # numbers: must appear in context/question (small counts and list numbering are tolerated)
    stripped = URL_RE.sub(" ", text)
    stripped = re.sub(r"(?m)^\s*\d+[.)]\s", "", stripped)  # numbered-list markers
    for n in NUMBER_RE.findall(stripped):
        d = _digits(n)
        if not d or d in ctx_numbers or d in ctx_compact:
            continue
        if d.isdigit() and int(d) <= 20 and not n.endswith("%"):
            continue
        return OutputCheck(False, f"unsupported_number:{n}")

    # technology-like names
    for tok in set(TECH_TOKEN.findall(stripped)):
        t = tok.lower()
        if tok in SAFE_CAPS or t in allowed_blob:
            continue
        if t.rstrip("s") in allowed_blob or re.sub(r"[^a-z0-9]", "", t) in re.sub(r"[^a-z0-9]", "", allowed_blob):
            continue
        return OutputCheck(False, f"unsupported_term:{tok}")

    # ordinary capitalised words mid-sentence (tools, places, orgs, people) must also come from the context
    unsupported = [w for w in set(CAPITALISED.findall(stripped))
                   if w not in SAFE_CAPS and w.lower() not in allowed_blob
                   and (vocabulary is None or w.lower() not in vocabulary)]
    if unsupported:
        return OutputCheck(False, f"unsupported_names:{','.join(sorted(unsupported)[:3])}")

    # overall lexical grounding
    a_tokens = tokens(stripped)
    if len(a_tokens) >= 6:
        grounded = sum(1 for t in a_tokens if t in allowed_blob)
        if grounded / len(a_tokens) < 0.35:
            return OutputCheck(False, "low_grounding")
    return OutputCheck(True)
