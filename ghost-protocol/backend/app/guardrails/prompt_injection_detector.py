"""Deterministic prompt-injection / jailbreak / exfiltration detector.

Works on several normalised views of the text (leetspeak, spaced-out letters, decoded
base64/hex/rot13 payloads, reversed text) so trivial obfuscation does not bypass it.
It is one independent layer; it is NOT assumed to be sufficient on its own.
"""
from __future__ import annotations

import base64
import binascii
import codecs
import re
import unicodedata
from dataclasses import dataclass, field

ZERO_WIDTH = dict.fromkeys(map(ord, "​‌‍⁠﻿­᠎"), None)
LEET = str.maketrans({"0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", "$": "s", "!": "i", "|": "i"})
SPACED_LETTERS = re.compile(r"\b(?:[a-z][\s.\-_*]){4,}[a-z]\b")
B64_TOKEN = re.compile(r"[A-Za-z0-9+/_-]{20,}={0,2}")
HEX_TOKEN = re.compile(r"(?:[0-9a-fA-F]{2}[\s:]?){12,}")

OVERRIDE_VERBS = r"(?:ignore|disregard|forget|override|bypass|discard|drop|skip|neglect|overrule|cancel|abandon|stop\s+following|do\s+not\s+follow|don'?t\s+follow)"
OVERRIDE_TARGETS = r"(?:instructions?|rules?|prompts?|guidelines?|restrictions?|constraints?|roles?|polic(?:y|ies)|programming|directives?|limitations?|guardrails?|filters?|safeguards?|training|context)"
EXFIL_VERBS = r"(?:reveal|show|print|repeat|output|display|dump|leak|expose|tell|give|share|return|send|recite|echo|write\s+out|read\s+out|paste|copy|disclose|export|list|what(?:'?s|\s+is|\s+are))"

# (name, kind, regex) - evaluated against normalised text
PATTERNS: list[tuple[str, str, re.Pattern]] = [
    ("override_previous", "override", re.compile(rf"\b{OVERRIDE_VERBS}\b[^.\n]{{0,40}}\b(?:previous|prior|above|earlier|preceding|original|initial|system|all|any|every|your|the|these|those|existing|current)\b[^.\n]{{0,30}}\b{OVERRIDE_TARGETS}\b")),
    ("override_restriction", "override", re.compile(r"\b(?:ignore|disregard|forget|drop|lift|remove|turn\s+off|disable|bypass)\b[^.\n]{0,30}\b(?:portfolio|domain|scope|topic)\b[^.\n]{0,20}\b(?:restriction|limit|limitation|rule|constraint|boundary|boundaries|policy|only)\b")),
    ("new_system_prompt", "override", re.compile(r"\b(?:treat|consider|take|use|accept|regard)\b[^.\n]{0,40}\bas\b[^.\n]{0,15}\b(?:your|the)\b[^.\n]{0,12}\b(?:new\s+)?(?:system\s+)?(?:prompt|instructions?|rules?|role)\b")),
    ("new_instructions", "override", re.compile(r"\b(?:new|updated|real|actual|true|revised|different)\s+(?:system\s+)?(?:instructions?|rules?|prompt|directives?)\b")),
    ("execute_instead", "override", re.compile(r"\b(?:execute|follow|obey|carry\s+out|perform|comply\s+with)\b[^.\n]{0,25}\b(?:following|these|this|below|next|decoded|hidden)\b[^.\n]{0,20}\b(?:instructions?|commands?|orders?|directives?|text|message)\b")),
    ("instead_of", "override", re.compile(r"\b(?:instead|rather)\b[^.\n]{0,20}\b(?:answer|respond|do|follow|execute)\b[^.\n]{0,40}\b(?:this|the following|my)\b")),
    ("from_now_on", "role", re.compile(r"\bfrom\s+now\s+on\b[^.\n]{0,40}\b(?:you|your|act|behave|respond|answer|ignore)\b")),
    ("role_change", "role", re.compile(r"\b(?:you\s+are\s+now|you\s+are\s+no\s+longer|you(?:'?re|\s+will)\s+now\s+be|stop\s+being|no\s+longer\s+(?:a|an|the)\s+(?:portfolio|assistant)|forget\s+that\s+you|forget\s+you\s+are)\b")),
    ("pretend", "role", re.compile(r"\b(?:pretend|imagine|roleplay|role-play|simulate)\b[^.\n]{0,20}\b(?:to\s+be|you\s+are|you'?re|as\s+(?:if|though)|like|as)\b[^.\n]{0,30}\b(?:another|different|unrestricted|unfiltered|jailbroken|evil|dan|chatgpt|gpt|gemini|claude|llama|ai|assistant|bot|human|hacker|developer|admin|root|god)\b")),
    ("act_as", "role", re.compile(r"\b(?:act|work|operate|function|play|respond|answer|reply|behave)\s+as\b[^.\n]{0,15}\b(?:an?\s+)?(?:unrestricted|unfiltered|uncensored|jailbroken|different|another|general|dan|chatgpt|gpt|developer|admin|root|evil|hacker|expert|tutor|teacher|translator|interpreter|terminal|shell|compiler)\b")),
    ("unrestricted", "role", re.compile(r"\b(?:unrestricted|unfiltered|uncensored|jailbroken|jailbreak|no\s+(?:restrictions?|rules?|limits?|filters?|guardrails?|boundaries)|without\s+(?:any\s+)?(?:restrictions?|rules?|limits?|filters?|guardrails?|censorship))\b")),
    ("dev_mode", "role", re.compile(r"\b(?:developer|dev|debug|god|admin|sudo|root|maintenance|jailbreak|dan|do\s+anything\s+now)\s+mode\b|\bdo\s+anything\s+now\b|\bDAN\b")),
    ("own_knowledge", "override", re.compile(r"\b(?:combine|mix|merge|add|supplement|augment|use|rely\s+on|draw\s+on|answer\s+from)\b[^.\n]{0,45}\b(?:your\s+(?:own|general|pre-?trained|training|internal|background)\s+(?:knowledge|data|information)|outside\s+knowledge|general\s+knowledge|what\s+you\s+know|training\s+data)\b")),
    ("beyond_portfolio", "override", re.compile(r"\b(?:outside|beyond|besides|apart\s+from|other\s+than)\s+(?:of\s+)?(?:the\s+|his\s+)?(?:portfolio|knowledge\s+base|provided\s+context)\b")),
    ("exfil_prompt", "exfiltration", re.compile(rf"\b{EXFIL_VERBS}\b[^.\n]{{0,30}}\b(?:your|the|ur|its)\b[^.\n]{{0,15}}\b(?:system|hidden|initial|original|internal|secret|full|entire|developer|pre)?[\s-]*(?:prompts?|instructions?|rules|guidelines|configuration|config|directives|policy|preamble|settings)\b")),
    ("exfil_prompt_noun", "exfiltration", re.compile(r"\b(?:system|hidden|initial|secret|developer)\s+(?:prompt|instructions?|message)\b")),
    ("exfil_kb", "exfiltration", re.compile(rf"\b{EXFIL_VERBS}\b[^.\n]{{0,25}}\b(?:all|every|entire|whole|full|complete|raw)\b[^.\n]{{0,25}}\b(?:documents?|chunks?|records?|embeddings?|vectors?|knowledge\s*base|data\s*base|database|files?|json|contents?|entries|data)\b")),
    ("exfil_kb_named", "exfiltration", re.compile(r"\b(?:faiss|vector\s+(?:store|database|db|index)|knowledge\s*base|embedding\s+(?:store|index|database))\b[^.\n]{0,40}\b(?:dump|contents?|everything|all|entire|export|raw|return)\b|\b(?:dump|export|return|print|list|show)\b[^.\n]{0,25}\b(?:faiss|vector\s+(?:store|database|db|index)|knowledge\s*base)\b")),
    ("exfil_secrets", "exfiltration", re.compile(r"(?<![a-z0-9])(?:api[\s_-]?keys?|secret[\s_-]?keys?|access[\s_-]?tokens?|auth(?:orization)?[\s_-]?tokens?|bearer\s+tokens?|env(?:ironment)?[\s_-]?(?:vars?|variables?|file)|dotenv|\.env|groq[\s_-]?\w*|faiss_\w+|allowed_origins|admin_token|embedding_model|similarity_threshold|private[\s_-]?keys?|passwords?|credentials?\s+(?:of|for|to)\s+(?:the\s+)?(?:server|backend|api|system|database))(?![a-z0-9])")),
    ("other_users", "exfiltration", re.compile(r"\b(?:other|previous|another|all|every)\s+(?:users?|visitors?|sessions?|conversations?|chats?|people|customers?)\b[^.\n]{0,40}\b(?:data|messages?|history|conversations?|information|queries|questions|chats?|know)\b|\b(?:know|information|data)\b[^.\n]{0,25}\babout\s+(?:other|previous|all)\s+(?:users?|visitors?|sessions?)\b")),
    ("execution", "execution", re.compile(r"\b(?:execute|run|eval|exec|invoke|launch|spawn|compile)\b[^.\n]{0,25}\b(?:code|command|commands|script|shell|bash|powershell|cmd|terminal|program|sql|query|python|javascript|payload)\b|\b(?:sudo|rm\s+-rf|chmod|os\.system|subprocess|__import__|eval\(|exec\(|import\s+os|curl\s+http|wget\s+http|powershell|cmd\.exe|/bin/(?:ba)?sh)\b")),
    ("markup_injection", "delimiter", re.compile(r"(?:<\|?(?:im_start|im_end|system|assistant|endoftext)\|?>|\[/?(?:inst|sys)\]|<</?sys>>|</?(?:system|instructions?|prompt)>|^\s*(?:system|assistant|developer)\s*:|\bend\s+of\s+(?:system\s+)?(?:prompt|instructions?|context)\b|\bbegin\s+(?:new\s+)?(?:system\s+)?(?:prompt|instructions?)\b|^\s*#{3,}\s*(?:system|instruction|new))", re.M)),
    ("decode_follow", "override", re.compile(r"\b(?:decode|decrypt|deobfuscate|translate|unscramble|rot13|base64|hex)\b[^.\n]{0,40}\b(?:and|then)\b[^.\n]{0,25}\b(?:follow|execute|obey|run|do|answer|comply)\b|\b(?:decode|decrypt|deobfuscate)\s+(?:this|the\s+following|these|that)\b[^.\n]{0,20}\b(?:instruction|command|message|text|string|payload)")),
    ("manipulate_retrieval", "override", re.compile(r"\b(?:set|change|lower|raise|modify|override|adjust|disable)\b[^.\n]{0,20}\b(?:similarity|threshold|top[\s_-]?k|retrieval|retriever|temperature|guardrails?|filters?|system\s+policy)\b")),
]

# Strong indicators that appear after decoding / de-obfuscation; checked as plain substrings of the squashed text.
SQUASHED_PHRASES = [
    "ignorepreviousinstructions", "ignoreallpreviousinstructions", "ignoreallinstructions", "disregardpreviousinstructions",
    "forgetpreviousinstructions", "ignoretheabove", "systemprompt", "revealyourprompt", "developermode", "jailbreak",
    "doanythingnow", "youarenowdan", "ignoreyourinstructions", "overridesysteminstructions", "newinstructions",
    "ignoreyourrules", "forgetyourinstructions", "forgetyourrules", "ignorethesystem",
]


@dataclass
class InjectionResult:
    detected: bool
    kind: str | None = None           # override | role | exfiltration | execution | delimiter | obfuscated
    matches: list[str] = field(default_factory=list)

    @property
    def is_exfiltration(self) -> bool:
        return self.kind == "exfiltration"


def normalise(text: str) -> str:
    text = unicodedata.normalize("NFKD", text)
    text = "".join(c for c in text if not unicodedata.combining(c))
    text = text.translate(ZERO_WIDTH)
    return re.sub(r"[ \t\r\f\v]+", " ", text).strip()


def _views(text: str) -> list[str]:
    base = normalise(text)
    lower = base.lower()
    views = [lower]
    leet = lower.translate(LEET)
    if leet != lower:
        views.append(leet)
    # "i g n o r e", "i.g.n.o.r.e" -> "ignore"
    def collapse(m: re.Match) -> str:
        return re.sub(r"[\s.\-_*]", "", m.group(0))
    for v in list(views):
        c = SPACED_LETTERS.sub(collapse, v)
        if c != v:
            views.append(c)
    # words split by separators inside: ig-nore / ig_nore / ig.nore
    for v in list(views):
        c = re.sub(r"(?<=[a-z])[\-_.*]+(?=[a-z])", "", v)
        if c != v:
            views.append(c)
    return views


def _decoded_views(text: str) -> list[str]:
    out: list[str] = []
    for tok in B64_TOKEN.findall(text):
        t = tok.replace("-", "+").replace("_", "/")
        t += "=" * (-len(t) % 4)
        try:
            dec = base64.b64decode(t, validate=False).decode("utf-8")
        except (binascii.Error, UnicodeDecodeError, ValueError):
            continue
        if dec and sum(c.isprintable() or c.isspace() for c in dec) / len(dec) > 0.9 and re.search(r"[a-zA-Z]{3}", dec):
            out.append(dec.lower())
    for tok in HEX_TOKEN.findall(text):
        raw = re.sub(r"[\s:]", "", tok)
        try:
            dec = bytes.fromhex(raw).decode("utf-8")
        except (ValueError, UnicodeDecodeError):
            continue
        if dec.isprintable():
            out.append(dec.lower())
    low = text.lower()
    if re.search(r"rot-?13|caesar|cipher|reverse|backwards?|encoded|encrypted|obfuscat", low):
        out.append(codecs.decode(low, "rot_13"))
        out.append(low[::-1])
    return out


def _scan(view: str) -> InjectionResult:
    hits = [(n, k) for n, k, rx in PATTERNS if rx.search(view)]
    if hits:
        priority = ["override", "role", "execution", "delimiter", "exfiltration"]
        kinds = {k for _, k in hits}
        # exfiltration is reported on its own only when no override/role signal exists
        kind = next((p for p in priority if p in kinds), hits[0][1])
        if kinds == {"exfiltration"}:
            kind = "exfiltration"
        return InjectionResult(True, kind, [n for n, _ in hits])
    squashed = re.sub(r"[^a-z]", "", view)
    for phrase in SQUASHED_PHRASES:
        if phrase in squashed:
            return InjectionResult(True, "override", [f"squashed:{phrase}"])
    return InjectionResult(False)


def detect_prompt_injection(text: str) -> InjectionResult:
    """Scan user-controlled text. Any positive view wins."""
    for v in _views(text):
        res = _scan(v)
        if res.detected:
            return res
    for d in _decoded_views(text):
        for v in _views(d):
            res = _scan(v)
            if res.detected:
                return InjectionResult(True, "obfuscated", ["decoded:" + m for m in res.matches])
    return InjectionResult(False)


# Retrieved documents are evidence, never instructions. We scan them with the same patterns
# but only the instruction-like kinds (a legitimate bio never says "ignore previous instructions").
_DOC_KINDS = {"override", "role", "delimiter", "execution", "obfuscated"}


def scan_untrusted_document(text: str) -> InjectionResult:
    res = detect_prompt_injection(text)
    if res.detected and res.kind in _DOC_KINDS:
        return res
    return InjectionResult(False)
