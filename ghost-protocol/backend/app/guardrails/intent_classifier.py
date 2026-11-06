"""Deterministic intent classifier with a conservative fallback.

Order of evaluation (first decisive result wins):
  1. prompt-injection / sensitive-information detector (independent module)
  2. hard out-of-scope requests (code, maths, weather, creative writing, trivia ...)
  3. portfolio *anchor* check: the question must refer to Prannavakhanth, his portfolio,
     one of his known projects, or a portfolio topic noun (projects, skills, education ...)
  4. category scoring (multi-label) -> PROJECTS + SKILLS etc.

Anything without an anchor is OUT_OF_SCOPE (or AMBIGUOUS when it is too short to judge).
Retrieval-based context checks (context_guard) provide a second, semantic line of defence,
so a question that slips past these rules is still rejected unless the knowledge base
contains sufficiently relevant evidence.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from enum import Enum

from app.guardrails.prompt_injection_detector import detect_prompt_injection, normalise


class Intent(str, Enum):
    PERSONAL_PROFILE = "PERSONAL_PROFILE"
    EDUCATION = "EDUCATION"
    SKILLS = "SKILLS"
    PROJECTS = "PROJECTS"
    EXPERIENCE = "EXPERIENCE"
    ACHIEVEMENTS = "ACHIEVEMENTS"
    RESEARCH = "RESEARCH"
    CONTACT = "CONTACT"
    PORTFOLIO_GENERAL = "PORTFOLIO_GENERAL"
    OUT_OF_SCOPE = "OUT_OF_SCOPE"
    PROMPT_INJECTION = "PROMPT_INJECTION"
    SENSITIVE_INFORMATION_REQUEST = "SENSITIVE_INFORMATION_REQUEST"
    AMBIGUOUS = "AMBIGUOUS"


ALLOWED_INTENTS = {
    Intent.PERSONAL_PROFILE, Intent.EDUCATION, Intent.SKILLS, Intent.PROJECTS, Intent.EXPERIENCE,
    Intent.ACHIEVEMENTS, Intent.RESEARCH, Intent.CONTACT, Intent.PORTFOLIO_GENERAL,
}
ADVERSARIAL_INTENTS = {Intent.PROMPT_INJECTION, Intent.SENSITIVE_INFORMATION_REQUEST}

INTENT_CATEGORIES: dict[Intent, set[str]] = {
    Intent.PERSONAL_PROFILE: {"personal_profile", "portfolio_general"},
    Intent.EDUCATION: {"education"},
    Intent.SKILLS: {"skills", "projects"},
    Intent.PROJECTS: {"projects"},
    Intent.EXPERIENCE: {"experience"},
    Intent.ACHIEVEMENTS: {"achievements"},
    Intent.RESEARCH: {"research"},
    Intent.CONTACT: {"contact"},
    Intent.PORTFOLIO_GENERAL: {"portfolio_general", "personal_profile"},
}


@dataclass
class Classification:
    primary: Intent
    intents: list[Intent] = field(default_factory=list)
    reason: str = ""
    entities: list[str] = field(default_factory=list)
    aggregate: bool = False
    smalltalk: str | None = None  # "greeting" | "capabilities" | "thanks"

    @property
    def allowed(self) -> bool:
        return self.primary in ALLOWED_INTENTS

    @property
    def adversarial(self) -> bool:
        return self.primary in ADVERSARIAL_INTENTS

    @property
    def categories(self) -> set[str]:
        cats: set[str] = set()
        for i in self.intents:
            cats |= INTENT_CATEGORIES.get(i, set())
        return cats


def _rx(p: str) -> re.Pattern:
    return re.compile(p, re.I)


GREETING = _rx(r"^\s*(?:hi+|hello+|hey+|hiya|yo|howdy|greetings|good\s+(?:morning|afternoon|evening|day)|sup|namaste|hola)\b[\s!.,?]*(?:there|assistant|bot)?[\s!.,?]*$")
THANKS = _rx(r"^\s*(?:thanks?|thank\s+you|thx|ty|cheers|great|awesome|cool|nice|ok(?:ay)?|got\s+it|bye|goodbye|see\s+you)\b[\s!.,?a-z]{0,25}$")
CAPABILITY = _rx(r"\b(?:what\s+can\s+you\s+(?:do|help)|how\s+can\s+you\s+help|what\s+do\s+you\s+do|who\s+are\s+you|what\s+are\s+you|what\s+is\s+this\s+(?:chat|chatbot|bot|assistant)|how\s+do\s+(?:i|you)\s+use\s+(?:this|you)|help\s+me\s+(?:use|navigate)|^help$)\b")

HARD_OOS = [
    _rx(r"\b(?:write|generate|create|build|make|code|implement|debug|fix|refactor|optimi[sz]e|compile|translate|solve|calculate|compute|draw|compose|draft|give\s+me|show\s+me)\b[^.?!\n]{0,30}\b(?:code|program|script|function|class|algorithm|snippet|regex|sql\s+query|query|html|css|app|website|bot|poem|song|story|essay|joke|email|letter|equation|proof|recipe|lyrics|haiku|limerick|cover\s+letter|resume)\b"),
    _rx(r"\b(?:weather|forecast|temperature\s+(?:in|today)|stock\s+price|share\s+price|exchange\s+rate|bitcoin|crypto(?:currency)?\s+price|news\s+(?:today|headlines)|latest\s+news|score\s+of|who\s+won\s+the|lottery|horoscope|recipe)\b"),
    _rx(r"\b(?:tell|say|sing|recite)\s+(?:me\s+)?(?:a\s+|an\s+)?(?:joke|riddle|poem|story|song|fun\s+fact|fact)\b"),
    _rx(r"\bcapital\s+of\b|\bpresident\s+of\b|\bprime\s+minister\s+of\b|\bpopulation\s+of\b|\bhow\s+many\s+(?:people|countries|planets)\b"),
    _rx(r"\b(?:solve|simplify|integrate|differentiate|factori[sz]e)\b|\b\d+\s*[-+*/^x]\s*\d+\s*(?:=|\?)|\bwhat\s+is\s+\d+\s*[-+*/^x]\s*\d+"),
    _rx(r"\b(?:quantum|relativity|photosynthesis|black\s+hole|big\s+bang|theory\s+of|periodic\s+table|world\s+war|climate\s+change|blockchain\s+explained)\b"),
    _rx(r"\b(?:homework|assignment|exam|quiz|interview\s+questions?)\s+(?:help|answers?|solutions?|for\s+me)\b"),
    _rx(r"\b(?:medical|legal|financial|investment|tax)\s+advice\b|\bshould\s+i\s+(?:invest|buy|sell|take\s+medication)\b"),
]

OWNER = _rx(r"\b(?:he|him|his|himself|prannavakhanth|prannavakhanth'?s|prannav|prnvvv)\b")
CREATIVE_VERBS = _rx(r"\b(?:write|generate|create|compose|draft|code|implement|debug|fix|solve|calculate|compute|draw|translate|optimi[sz]e|refactor)\b")
ANCHOR_PRONOUN = _rx(r"\b(?:he|him|his|himself|prannavakhanth|prannavakhanth'?s|prannav|prnvvv|pranavakhanth|the\s+owner|the\s+developer|the\s+engineer|your|yours|yourself)\b|\bhis\b")
ANCHOR_SITE = _rx(r"\b(?:portfolio|this\s+(?:website|site|page)|the\s+website)\b")
FOLLOW_UP = _rx(r"\b(?:it|its|that|this|those|these|them|their|there|the\s+(?:first|second|third|last|other|same)\s+(?:one|project|role|job)|more\s+(?:about|details|on|info)|tell\s+me\s+more|elaborate|expand|go\s+on|continue|and\s+(?:what|how|why|which|where|when)|what\s+about|how\s+about|why)\b")

# Strong topic nouns: a portfolio question can be anchored by these alone ("What projects are listed?")
STRONG_NOUNS = {
    Intent.PROJECTS: _rx(r"\bprojects?\b|\bmissions?\b|\bprototypes?\b|\bgithub\s+repos?\b|\bcase\s+stud(?:y|ies)\b"),
    Intent.SKILLS: _rx(r"\bskills?\b|\bskill\s*set\b|\btech(?:nical)?\s+stack\b|\bprogramming\s+languages?\b|\bframeworks?\b|\btechnologies\b|\btechnical\s+(?:skills?|expertise|background)\b|\bexpertise\b|\bproficien\w*\b"),
    Intent.EDUCATION: _rx(r"\beducation(?:al)?\b|\bdegree\b|\buniversity\b|\bcollege\b|\bcgpa\b|\bgpa\b|\bb\.?\s?tech\b|\bacademic\w*\b|\bcertifications?\b|\bcertificates?\b|\bcourses?\b|\bschool(?:ing)?\b|\bgraduat\w+\b|\bvit\b"),
    Intent.EXPERIENCE: _rx(r"\bexperience\b|\bwork(?:ed|s|ing)?\s+(?:at|for|experience|history)\b|\bwhere\s+(?:does|is)\s+he\s+work(?:ing)?\b|\bjobs?\b|\bintern(?:ship|ships)?\b|\bemploy\w+\b|\bcareer\b|\bcompany\b|\bcompanies\b|\bprofessional\b|\bleadership\b|\bleader\b|\bchair(?:person|man)?\b|\bpresident\b|\bsecretary\b|\bpositions?\b|\broles?\b|\bresponsibilit\w+\b|\bcbre\b|\bhexaware\b|\bospc\b|\bannamai\b|\biit\s+ropar\b|\bstudent\s+council\b"),
    Intent.ACHIEVEMENTS: _rx(r"\bachievements?\b|\bawards?\b|\bhackathons?\b|\bwon\b|\bwins?\b|\bwinner\b|\bprizes?\b|\brecogni\w+\b|\btopper\b|\baccomplish\w+\b|\bhonou?rs?\b|\bcompetitions?\b|\bpitchathon\b|\bcricket\w*\b"),
    Intent.RESEARCH: _rx(r"\bresearch\w*\b|\bpapers?\b|\bpublications?\b|\bpublished\b|\bpatents?\b|\bjournal\b|\bpeer[\s-]review\w*\b|\bscholar\w*\b|\bthesis\b"),
    Intent.CONTACT: _rx(r"\bcontact\w*\b|\be-?mail\b|\breach\b|\blinkedin\b|\bgithub\b|\bsocial\s+(?:media|links?|profiles?)\b|\bhire\b|\bhiring\b|\bget\s+in\s+touch\b|\bconnect\b|\bphone\b|\bresume\b|\bcv\b"),
    Intent.PERSONAL_PROFILE: _rx(r"\bwho\s+(?:is|'s)\s+(?:he|prannavakhanth|prannav|prnvvv|this)\b|\babout\s+(?:him|prannavakhanth|prannav|prnvvv|himself)\b|\bbackground\b|\bbio(?:graphy)?\b|\bintroduc\w+\b|\bwhere\s+(?:is\s+he|does\s+he\s+(?:live|stay)|(?:is\s+)?he\s+(?:from|based|located))\b|\blocation\b|\bbased\s+in\b|\binterests?\b|\bhobb(?:y|ies)\b|\bspeciali[sz]\w+\b|\bpersonal\b|\bprofile\b|\bname\b"),
    Intent.PORTFOLIO_GENERAL: _rx(r"\bportfolio\b|\bwebsite\b|\bthis\s+site\b|\bsections?\b|\bdossier\b|\bservice\s+record\b"),
}
# Weak topic terms only count when anchored by a pronoun / entity / follow-up
WEAK_TERMS = {
    Intent.SKILLS: _rx(r"\b(?:python|java|javascript|typescript|c\+\+|c/c\+\+|sql|r|react|node\.?js|fastapi|django|flask|docker|aws|git|tensorflow|pytorch|keras|scikit-?learn|langchain|langgraph|opencv|yolo|mediapipe|pandas|numpy|llms?|machine\s+learning|deep\s+learning|ml|ai|nlp|computer\s+vision|rag|agentic|generative|gen\s*ai|genai|neural\s+networks?|data\s+science|software|engineering|programming|coding|cloud|tools?|libraries|library|stack|languages?|know|knows|use|uses|used|proficient|good\s+at|familiar)\b"),
    Intent.PROJECTS: _rx(r"\b(?:built|build|developed|develop|created|made|app|application|platform|system|tool|chatbot|model|demo|live|deployed|repo|repository|source\s+code|architecture|features?|problem|solution)\b"),
    Intent.EXPERIENCE: _rx(r"\b(?:work|worked|working|lead|led|manages?|managed)\b"),
    Intent.ACHIEVEMENTS: _rx(r"\b(?:win|won|achieve\w*|best|top|first\s+place|1st)\b"),
    Intent.EDUCATION: _rx(r"\b(?:study|studied|studies|studying|learn\w*|class|grade|marks?|percentage|score)\b"),
}
DEFINITIONAL = _rx(r"^\s*(?:what|who|whom|whose|how|why|when|where|which|can|could|would|should|explain|define|describe|tell|teach|show|give|list|compare|is|are|do|does|did)\b")
AGGREGATE = _rx(r"\b(?:all|every|each|list|compare|comparison|contrast|differences?|versus|vs\.?|overview|summari[sz]e|summary|everything|different|various|both|which\s+(?:one|project|of))\b")


def _word_count(s: str) -> int:
    return len(re.findall(r"\w+", s))


def classify_intent(message: str, entities: list[str] | None = None, has_history: bool = False) -> Classification:
    entities = entities or []
    text = normalise(message)
    low = text.lower()

    # 1) adversarial -------------------------------------------------------
    inj = detect_prompt_injection(text)
    if inj.detected:
        primary = Intent.SENSITIVE_INFORMATION_REQUEST if inj.is_exfiltration else Intent.PROMPT_INJECTION
        return Classification(primary, [primary], reason=f"injection:{inj.kind}:{','.join(inj.matches[:3])}")

    # 2) small talk ----------------------------------------------------------
    if GREETING.match(low):
        return Classification(Intent.PORTFOLIO_GENERAL, [Intent.PORTFOLIO_GENERAL], "smalltalk", smalltalk="greeting")
    if THANKS.match(low):
        return Classification(Intent.PORTFOLIO_GENERAL, [Intent.PORTFOLIO_GENERAL], "smalltalk", smalltalk="thanks")
    if CAPABILITY.search(low):
        return Classification(Intent.PORTFOLIO_GENERAL, [Intent.PORTFOLIO_GENERAL], "smalltalk", smalltalk="capabilities")

    anchored_pronoun = bool(ANCHOR_PRONOUN.search(low))
    anchored_site = bool(ANCHOR_SITE.search(low))
    anchored_entity = bool(entities)
    anchored_followup = has_history and bool(FOLLOW_UP.search(low)) and _word_count(low) <= 14
    anchored = anchored_pronoun or anchored_site or anchored_entity or anchored_followup

    # 3) hard out-of-scope -----------------------------------------------------
    owner_ref = bool(OWNER.search(low)) or anchored_entity
    for rx in HARD_OOS:
        if rx.search(low):
            # Unrelated topics are always rejected. Topics that merely overlap a portfolio question
            # (e.g. "his weather app") pass only when the owner is explicitly referenced and the
            # visitor is not asking the assistant to produce something (code, essays, maths ...).
            if not owner_ref or CREATIVE_VERBS.search(low):
                return Classification(Intent.OUT_OF_SCOPE, [Intent.OUT_OF_SCOPE], "hard_oos")

    # 4) category scoring --------------------------------------------------------
    scores: dict[Intent, int] = {}
    for intent, rx in STRONG_NOUNS.items():
        n = len(rx.findall(low))
        if n:
            scores[intent] = scores.get(intent, 0) + 3 * n
    strong_hit = bool(scores)
    if anchored:
        for intent, rx in WEAK_TERMS.items():
            n = len(rx.findall(low))
            if n:
                scores[intent] = scores.get(intent, 0) + n
    if anchored_entity:
        scores[Intent.PROJECTS] = scores.get(Intent.PROJECTS, 0) + 4

    aggregate = bool(AGGREGATE.search(low))

    # 5) anchor decision -----------------------------------------------------------
    if not (anchored or strong_hit):
        if _word_count(low) <= 2:
            return Classification(Intent.AMBIGUOUS, [Intent.AMBIGUOUS], "too_short_no_anchor")
        return Classification(Intent.OUT_OF_SCOPE, [Intent.OUT_OF_SCOPE], "no_portfolio_anchor")

    # a bare strong noun inside a generic "what is X / explain X" question (e.g. "What is a research paper?")
    if not anchored and DEFINITIONAL.match(low) and re.match(r"^\s*(?:what|who)\s+(?:is|are)\s+(?:an?\s+)?\w+(?:\s+\w+)?\s*\??\s*$", low) \
            and not anchored_site:
        return Classification(Intent.OUT_OF_SCOPE, [Intent.OUT_OF_SCOPE], "generic_definition")

    if not scores:
        # anchored (e.g. "he"), but no recognised topic
        if _word_count(low) <= 3 and not anchored_entity and not anchored_site:
            if anchored_followup and not has_history:
                return Classification(Intent.AMBIGUOUS, [Intent.AMBIGUOUS], "bare_followup")
            return Classification(Intent.AMBIGUOUS, [Intent.AMBIGUOUS], "anchored_but_vague")
        scores[Intent.PORTFOLIO_GENERAL] = 1

    ordered = sorted(scores, key=lambda i: scores[i], reverse=True)
    # keep intents that carry meaningful weight
    top = scores[ordered[0]]
    intents = [i for i in ordered if scores[i] >= max(1, top // 3)]
    if anchored_followup and not (strong_hit or anchored_entity) and not anchored_pronoun:
        # carry no new topic: let retrieval decide using the previous turn's context
        intents = [Intent.PORTFOLIO_GENERAL]
    return Classification(intents[0], intents, "portfolio", entities=entities, aggregate=aggregate)
