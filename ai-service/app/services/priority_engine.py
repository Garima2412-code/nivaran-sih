"""
Deterministic priority safety net.

The LLM (or fallback classifier) proposes a priority, but this module can
only ever ESCALATE it, never downgrade it. This guarantees that an obvious
public-safety-critical complaint can never be silently under-prioritised
because of an LLM mistake.
"""

import re
from app.data.departments import VALID_PRIORITIES

_PRIORITY_RANK = {p: i for i, p in enumerate(VALID_PRIORITIES)}  # LOW=0 ... CRITICAL=3

# Keyword groups, ordered from most to least severe. Each keyword is matched
# as a whole-word/phrase, case-insensitively.
_CRITICAL_KEYWORDS = [
    r"open manhole", r"live wire", r"electrocut", r"gas leak", r"collapsed building",
    r"building collaps", r"fire hazard", r"child(ren)? (fell|falling|almost fell)",
    r"near school", r"outside school", r"near a school", r"hospital",
    r"death", r"died", r"drowning", r"drown", r"life[- ]threatening",
    r"contaminated water", r"sewage (mixing|mixed) with drinking water",
]

_HIGH_KEYWORDS = [
    r"accident", r"almost fell", r"fell (down|into)", r"injur", r"leaking for \d+ days?",
    r"leaking for (two|three|four|five|several) days?", r"no water supply",
    r"overflow", r"blocked drain", r"road safety", r"safety risk", r"safety hazard",
    r"dangerous", r"pothole", r"exposed wire",
]

_MEDIUM_KEYWORDS = [
    r"not (been )?collected", r"not working", r"illegal dumping", r"garbage",
    r"streetlight", r"overgrown", r"fallen tree", r"mosquito",
]


def _matches_any(text: str, patterns) -> bool:
    return any(re.search(p, text) for p in patterns)


def apply_safety_rules(complaint_text: str, llm_priority: str) -> tuple[str, bool]:
    """
    Returns (final_priority, was_escalated).

    `llm_priority` is trusted as the floor; deterministic keyword rules can
    only raise it, never lower it, and only if the rule-implied priority
    outranks what the LLM already gave.
    """
    text = complaint_text.lower()

    if llm_priority not in _PRIORITY_RANK:
        llm_priority = "MEDIUM"  # safe default if something invalid slipped through

    rule_priority = "LOW"
    if _matches_any(text, _CRITICAL_KEYWORDS):
        rule_priority = "CRITICAL"
    elif _matches_any(text, _HIGH_KEYWORDS):
        rule_priority = "HIGH"
    elif _matches_any(text, _MEDIUM_KEYWORDS):
        rule_priority = "MEDIUM"

    if _PRIORITY_RANK[rule_priority] > _PRIORITY_RANK[llm_priority]:
        return rule_priority, True

    return llm_priority, False
