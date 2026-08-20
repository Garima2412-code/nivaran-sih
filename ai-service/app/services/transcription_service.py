"""
Voice/audio transcription.

Uses the configured Gemini API for speech-to-text transcription.
If the Gemini client is unavailable, or the transcription request fails,
the service returns a clear error instead of fabricating a transcript.

The text-only `/api/ai/analyze` workflow is completely unaffected.
"""

import logging

from fastapi import HTTPException, UploadFile

from app.config import settings
from app.services.grievance_analyzer import _client
from app.services.language_service import detect_language, language_name
from app.schemas.grievance import TranscribeResponse
from google.genai import types

logger = logging.getLogger("jansahay.transcription")


async def transcribe_audio(file: UploadFile) -> TranscribeResponse:
    if _client is None:
        raise HTTPException(
            status_code=503,
            detail=(
                "Voice transcription is unavailable: "
                "GEMINI_API_KEY is not configured."
            ),
        )

    audio_bytes = await file.read()

    if not audio_bytes:
        raise HTTPException(
            status_code=422,
            detail="Uploaded audio file is empty.",
        )

    mime_type = file.content_type or "audio/wav"

    try:
        response = _client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=[
                (
                    "Transcribe the speech in this audio file accurately. "
                    "Return only the spoken transcript as plain text. "
                    "Do not add explanations, summaries, labels, or markdown."
                ),
                types.Part.from_bytes(
                    data=audio_bytes,
                    mime_type=mime_type,
                ),
            ],
        )
    except Exception as exc:
        logger.error("Gemini audio transcription error: %s", exc)
        raise HTTPException(
            status_code=502,
            detail="Transcription provider error.",
        )

    transcript = (response.text or "").strip()

    if not transcript:
        raise HTTPException(
            status_code=502,
            detail="Transcription provider returned an empty transcript.",
        )

    lang_code, _confidence = detect_language(transcript)

    return TranscribeResponse(
        language=lang_code,
        language_name=language_name(lang_code),
        transcript=transcript,
    )