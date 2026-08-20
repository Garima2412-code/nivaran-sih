"""
Multilingual support.

Detection: uses `langdetect` (pure-Python, offline, no network/model
download required) so this always works, even in fallback mode.

Translation-to-English (needed so the fixed department/category taxonomy
and keyword-fallback classifier can operate on one common representation):
  - If GEMINI_API_KEY is configured, the LLM performs translation and
    classification together in a single call (see grievance_analyzer).
  - If not configured, there is currently NO offline translation engine
    wired in. Non-English complaints in fallback mode will still get a
    language label from langdetect, but category/department classification
    falls back to running the English keyword matcher directly on the
    original text, which will generally under-perform on non-English input.
    This limitation is documented in the README rather than silently
    hidden.
"""

import logging
from langdetect import detect_langs, LangDetectException

logger = logging.getLogger("jansahay.language")

# Small, extensible map. Add more Indian languages here as needed --
# nothing else in the codebase needs to change to support a new language.
LANGUAGE_NAMES = {
    "en": "English",
    "hi": "Hindi",
    "kn": "Kannada",
    "ta": "Tamil",
    "te": "Telugu",
    "mr": "Marathi",
    "bn": "Bengali",
    "gu": "Gujarati",
    "ml": "Malayalam",
    "pa": "Punjabi",
    "ur": "Urdu",
}

SUPPORTED_LANGUAGES = {"en", "hi", "kn"}  # explicitly supported per spec; others detected best-effort


def language_name(code: str) -> str:
    return LANGUAGE_NAMES.get(code, code.upper())


def detect_language(text: str) -> tuple[str, float]:
    """Returns (iso_code, confidence). Defaults to ('en', 0.34) — a
    deliberately low confidence — if detection fails on very short/ambiguous
    text, rather than pretending certainty it doesn't have."""
    text = (text or "").strip()
    if not text:
        return "en", 0.0
    try:
        candidates = detect_langs(text)
        if not candidates:
            return "en", 0.34
        top = candidates[0]
        return top.lang, round(float(top.prob), 4)
    except LangDetectException:
        logger.info("Language detection failed for input of length %d; defaulting to 'en'.", len(text))
        return "en", 0.34
