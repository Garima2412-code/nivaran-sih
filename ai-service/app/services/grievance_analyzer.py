import json
import re
import logging
from typing import Optional

from fastapi import HTTPException
from google import genai

from app.config import settings
from app.data.departments import (
    VALID_DEPARTMENTS,
    VALID_SUBCATEGORIES,
    VALID_PRIORITIES,
    resolve_department,
)
from app.prompts.grievance_prompt import SYSTEM_PROMPT, build_user_prompt
from app.schemas.grievance import GrievanceAnalyzeResponse, LocationContext
from app.services.priority_engine import apply_safety_rules
from app.services.language_service import detect_language, language_name

logger = logging.getLogger("jansahay.analyzer")

_client = None
if settings.GEMINI_API_KEY:
    _client = genai.Client(api_key=settings.GEMINI_API_KEY)
# ---------------------------------------------------------------------------
# Lightweight entity extraction (used by the fallback path, and to fill in
# anything the LLM left null). Deliberately conservative: returns None
# rather than guessing when nothing matches, per the "do not fabricate"
# requirement.
# ---------------------------------------------------------------------------

_DURATION_PATTERN = re.compile(
    r"\b(?:for|since|over)?\s*((?:the\s+)?(?:last|past)?\s*\d+\s*(?:days?|weeks?|months?|hours?|years?))\b",
    re.IGNORECASE,
)
_LOCATION_PATTERN = re.compile(
    r"\b(?:near|outside|opposite|beside|next to|in front of|at)\s+([A-Z][A-Za-z0-9.'\- ]{2,40}?)(?=[.,;]| for | since | and |$)",
)


def _extract_duration(text: str) -> Optional[str]:
    match = _DURATION_PATTERN.search(text)
    if match:
        return re.sub(r"\s+", " ", match.group(1)).strip()
    return None


def _extract_location(text: str) -> Optional[str]:
    match = _LOCATION_PATTERN.search(text)
    if match:
        return match.group(1).strip().rstrip(".")
    return None


def _extract_issue(sub_category: str) -> str:
    # Cheap, deterministic "issue" phrase derived from the resolved
    # sub-category (used by the fallback path where there is no LLM to
    # phrase a natural issue description).
    return sub_category

# ---------------------------------------------------------------------------
# Fallback (no API key) rule-based classifier
# ---------------------------------------------------------------------------
# Keeps the API fully runnable/demoable without external credentials.
# Real deployments should set GEMINI_API_KEY so the LLM path is used.

_FALLBACK_RULES = [
    # (regex, sub_category, base_priority, base_confidence)
    (r"pothole", "Pothole", "HIGH", 0.75),
    (r"footpath", "Footpath Damage", "MEDIUM", 0.7),
    (r"road.*(obstruct|block)|obstruct.*road", "Road Obstruction", "MEDIUM", 0.65),
    (r"road (is )?damag|broken road|cracked road", "Damaged Road", "MEDIUM", 0.7),

    (r"water.*leak|leak.*water", "Water Leakage", "HIGH", 0.75),
    (r"no water|water supply.*(stop|not)", "No Water Supply", "HIGH", 0.75),
    (r"contaminat|dirty water|smell.*water", "Contaminated Water", "CRITICAL", 0.7),
    (r"low (water )?pressure", "Low Water Pressure", "MEDIUM", 0.65),

    (r"sewage.*overflow|overflow.*sewage", "Sewage Overflow", "HIGH", 0.75),
    (r"open manhole|manhole.*open", "Open Manhole", "CRITICAL", 0.8),
    (r"block(ed)? drain|drain.*block", "Blocked Drain", "MEDIUM", 0.7),
    (r"drainage", "Drainage Problem", "MEDIUM", 0.65),

    (r"garbage.*not.*collect|not.*collect.*garbage", "Garbage Not Collected", "MEDIUM", 0.75),
    (r"illegal dump", "Illegal Dumping", "MEDIUM", 0.75),
    (r"overflow.*(bin|garbage)|garbage bin.*overflow", "Overflowing Garbage Bin", "MEDIUM", 0.7),

    (r"streetlight.*not work|street light.*not work", "Streetlight Not Working", "MEDIUM", 0.75),
    (r"streetlight.*damag|street light.*damag", "Damaged Streetlight", "MEDIUM", 0.7),

    (r"park.*maintenance|maintenance.*park", "Park Maintenance", "LOW", 0.65),
    (r"fallen tree|tree.*fell|tree.*fallen", "Fallen Tree", "HIGH", 0.7),
    (r"overgrown", "Overgrown Vegetation", "LOW", 0.6),

    (r"illegal construction", "Illegal Construction", "MEDIUM", 0.7),
    (r"building violation", "Building Violation", "MEDIUM", 0.65),

    (r"mosquito", "Mosquito Infestation", "MEDIUM", 0.75),
    (r"hygien", "Public Hygiene", "MEDIUM", 0.6),
    (r"health hazard", "Public Health Hazard", "HIGH", 0.65),
]


def _fallback_classify(complaint: str) -> dict:
    text = complaint.lower()
    for pattern, sub_category, priority, confidence in _FALLBACK_RULES:
        if re.search(pattern, text):
            department = resolve_department(sub_category)
            return {
                "category": department,
                "sub_category": sub_category,
                "issue": _extract_issue(sub_category),
                "department": department,
                "priority": priority,
                "summary": complaint.strip()[:120].rstrip(".") + ".",
                "confidence": confidence,
                "reason": (
                    "Matched via deterministic keyword fallback classifier "
                    "(no GEMINI_API_KEY configured)."
                ),
                "location": _extract_location(complaint),
                "duration": _extract_duration(complaint),
            }
    # Nothing matched -> low-confidence generic bucket
    return {
        "category": "Public Health",
        "sub_category": "Public Health Hazard",
        "issue": "Unclassified issue",
        "department": "Public Health",
        "priority": "LOW",
        "summary": "Complaint is ambiguous and could not be confidently classified.",
        "confidence": 0.3,
        "reason": "No fallback keyword rule matched; complaint text is too vague.",
        "location": _extract_location(complaint),
        "duration": _extract_duration(complaint),
    }


# ---------------------------------------------------------------------------
# LLM path
# ---------------------------------------------------------------------------

def _extract_json(raw: str) -> dict:
    raw = raw.strip()
    # Strip markdown fences if the model added them anyway.
    if raw.startswith("```"):
        raw = re.sub(r"^```(json)?", "", raw).rstrip("`").strip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except json.JSONDecodeError:
                pass
        raise HTTPException(
            status_code=502,
            detail="LLM returned invalid JSON that could not be parsed.",
        )


def _call_llm(complaint: str) -> dict:
    if _client is None:
        raise RuntimeError("no client configured")

    try:
        response = _client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=(
                SYSTEM_PROMPT
                + "\n\n"
                + build_user_prompt(complaint)
            ),
        )
    except Exception as exc:
        logger.error("Gemini API error: %s", exc)
        raise HTTPException(
            status_code=502,
            detail="LLM provider error.",
        )

    content = response.text or ""
    return _extract_json(content)


def _sanitize_llm_output(raw: dict, complaint: str) -> dict:
    """Repair/validate whatever the LLM produced against our fixed taxonomy
    so an invalid department/sub_category/priority can never leak out."""
    sub_category = raw.get("sub_category", "")
    if sub_category not in VALID_SUBCATEGORIES:
        # LLM invented or mis-cased a sub-category -> fall back to keyword match
        fallback = _fallback_classify(complaint)
        sub_category = fallback["sub_category"]

    department = resolve_department(sub_category, raw.get("department", ""))
    category = department  # category == department name in this taxonomy

    priority = str(raw.get("priority", "MEDIUM")).upper()
    if priority not in VALID_PRIORITIES:
        priority = "MEDIUM"

    try:
        confidence = float(raw.get("confidence", 0.5))
    except (TypeError, ValueError):
        confidence = 0.5
    confidence = max(0.0, min(1.0, confidence))

    summary = str(raw.get("summary", "")).strip()
    if not summary:
        summary = complaint.strip()[:120].rstrip(".") + "."
    words = summary.split()
    if len(words) > 25:
        summary = " ".join(words[:25])

    reason = str(raw.get("reason", "")).strip() or "Classified based on complaint content."

    issue = str(raw.get("issue", "")).strip() or _extract_issue(sub_category)

    location = raw.get("location")
    location = str(location).strip() if location else None
    if location and location.lower() in ("null", "none", "n/a", ""):
        location = None

    duration = raw.get("duration")
    duration = str(duration).strip() if duration else None
    if duration and duration.lower() in ("null", "none", "n/a", ""):
        duration = None

    return {
        "category": category,
        "sub_category": sub_category,
        "issue": issue,
        "department": department,
        "priority": priority,
        "summary": summary,
        "confidence": confidence,
        "reason": reason,
        "location": location,
        "duration": duration,
    }


def analyze_grievance(
    complaint: str,
    latitude: Optional[float],
    longitude: Optional[float],
    language: Optional[str] = None,
) -> GrievanceAnalyzeResponse:
    if not complaint or not complaint.strip():
        raise HTTPException(status_code=422, detail="complaint must not be empty.")

    if language:
        lang_code = language
        lang_confidence = 1.0  # citizen/app explicitly supplied the language
    else:
        lang_code, lang_confidence = detect_language(complaint)

    if settings.AI_FALLBACK_MODE:
        # No LLM available to translate non-English text; the keyword
        # fallback classifier only understands English patterns, so
        # non-English input will generally land in the low-confidence
        # generic bucket. This is a documented limitation, not silently
        # hidden behind a fake translation.
        result = _fallback_classify(complaint)
    else:
        try:
            raw = _call_llm(complaint)
        except RuntimeError:
            # Defensive: client somehow missing despite key being set.
            raw = None
        if raw is None:
            result = _fallback_classify(complaint)
        else:
            result = _sanitize_llm_output(raw, complaint)

    final_priority, escalated = apply_safety_rules(complaint, result["priority"])
    reason = result["reason"]
    if escalated:
        reason += (
            f" Priority escalated to {final_priority} by deterministic public-safety rules."
        )

    return GrievanceAnalyzeResponse(
        category=result["category"],
        sub_category=result["sub_category"],
        issue=result["issue"],
        department=result["department"],
        priority=final_priority,
        summary=result["summary"],
        location=result.get("location"),
        duration=result.get("duration"),
        latitude=latitude,
        longitude=longitude,
        confidence=result["confidence"],
        reason=reason,
        language=lang_code,
        language_name=language_name(lang_code),
        location_context=LocationContext(latitude=latitude, longitude=longitude),
    )
