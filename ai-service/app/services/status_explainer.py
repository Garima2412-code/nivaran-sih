import json
import re
import logging

from fastapi import HTTPException
from app.config import settings
from app.prompts.grievance_prompt import (
    STATUS_EXPLAIN_SYSTEM_PROMPT,
    build_status_user_prompt,
)
from app.schemas.grievance import StatusExplainResponse
from app.services.grievance_analyzer import _client, _extract_json

logger = logging.getLogger("jansahay.status")

_STATUS_TEMPLATES = {
    "FIELD_INSPECTION_COMPLETED": "An officer has inspected the issue and forwarded it to the maintenance team for action.",
    "ASSIGNED": "Your grievance has been assigned to the concerned department for action.",
    "IN_PROGRESS": "Work on your grievance is currently in progress.",
    "RESOLVED": "Your grievance has been resolved. Please let us know if the issue persists.",
    "REJECTED": "Your grievance could not be processed. Please see the remarks for details.",
    "PENDING": "Your grievance has been received and is awaiting action.",
}


def _fallback_explain(status: str, department: str, remarks: str) -> str:
    base = _STATUS_TEMPLATES.get(
        status.upper().replace(" ", "_"),
        f"Your grievance status has been updated to '{status}' by the {department} department.",
    )
    if remarks:
        base += f" Officer remarks: {remarks.strip().rstrip('.')}."
    return base


def explain_status(
    status: str,
    department: str,
    remarks: str,
) -> StatusExplainResponse:
    if not status or not status.strip():
        raise HTTPException(
            status_code=422,
            detail="status must not be empty.",
        )

    if not department or not department.strip():
        raise HTTPException(
            status_code=422,
            detail="department must not be empty.",
        )

    if settings.AI_FALLBACK_MODE or _client is None:
        message = _fallback_explain(status, department, remarks)
        return StatusExplainResponse(citizen_message=message)

    try:
        response = _client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=(
                STATUS_EXPLAIN_SYSTEM_PROMPT
                + "\n\n"
                + build_status_user_prompt(status, department, remarks)
            ),
        )
    except Exception as exc:
        logger.error("Gemini API error: %s", exc)
        raise HTTPException(
            status_code=502,
            detail="LLM provider error.",
        )

    content = response.text or ""

    try:
        parsed = _extract_json(content)
        message = str(parsed.get("citizen_message", "")).strip()

        if not message:
            raise ValueError("empty citizen_message")

    except Exception:
        message = _fallback_explain(status, department, remarks)

    return StatusExplainResponse(citizen_message=message)