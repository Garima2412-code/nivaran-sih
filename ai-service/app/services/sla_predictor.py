"""
Predictive SLA breach-risk scoring.

IMPORTANT — honesty about what this is: this is a transparent, deterministic
rule-based risk scorer, NOT a trained machine-learning model. No historical
grievance data has been used to fit it. It is designed so a real model
(e.g. a gradient-boosted classifier trained on resolved-vs-breached
historical tickets) could later be swapped in behind the same
`predict_sla_risk()` function signature without touching the route or
schema layer.

Scoring approach:
  risk_score (0-1) is a weighted combination of:
    - time_fraction_elapsed = elapsed / total_sla_duration
    - priority weight (CRITICAL/HIGH push risk up faster)
    - status weight (a grievance still "PENDING"/"UNDER_REVIEW" close to
      its deadline is riskier than one already "IN_PROGRESS" or resolved)
  risk_level and predicted_breach are then derived from risk_score using
  fixed thresholds.
"""

from datetime import datetime, timedelta
from typing import Optional

from fastapi import HTTPException

from app.data.departments import get_sla_hours, get_escalation_levels, VALID_PRIORITIES
from app.schemas.grievance import SLARiskRequest, SLARiskResponse

_PRIORITY_WEIGHT = {"LOW": 0.0, "MEDIUM": 0.1, "HIGH": 0.2, "CRITICAL": 0.3}

_STALLED_STATUSES = {"PENDING", "UNDER_REVIEW", "ASSIGNED", "SUBMITTED", "OPEN"}
_ACTIVE_STATUSES = {"IN_PROGRESS", "FIELD_INSPECTION_COMPLETED", "ESCALATED"}
_CLOSED_STATUSES = {"RESOLVED", "CLOSED", "REJECTED"}

_STATUS_WEIGHT_STALLED = 0.15
_STATUS_WEIGHT_ACTIVE = 0.05
_STATUS_WEIGHT_CLOSED = -0.5


def _parse_dt(value: Optional[str], field_name: str) -> Optional[datetime]:
    if value is None:
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        raise HTTPException(
            status_code=422, detail=f"Invalid ISO 8601 datetime for '{field_name}': {value}"
        )


def predict_sla_risk(payload: SLARiskRequest) -> SLARiskResponse:
    priority = payload.priority.upper()
    if priority not in VALID_PRIORITIES:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid priority '{payload.priority}'. Must be one of {VALID_PRIORITIES}.",
        )

    created_at = _parse_dt(payload.created_at, "created_at")
    if created_at is None:
        raise HTTPException(status_code=422, detail="created_at is required.")

    current_time = _parse_dt(payload.current_time, "current_time") or datetime.utcnow()

    sla_hours = get_sla_hours(payload.department, payload.category)
    sla_deadline = _parse_dt(payload.sla_deadline, "sla_deadline")
    if sla_deadline is None:
        sla_deadline = created_at + timedelta(hours=sla_hours)

    total_seconds = max((sla_deadline - created_at).total_seconds(), 1.0)
    elapsed_seconds = (current_time - created_at).total_seconds()
    if payload.days_elapsed is not None:
        elapsed_seconds = max(elapsed_seconds, payload.days_elapsed * 86400)

    remaining_seconds = (sla_deadline - current_time).total_seconds()
    remaining_hours = round(remaining_seconds / 3600, 2)

    time_fraction_elapsed = max(0.0, min(elapsed_seconds / total_seconds, 1.5))

    status_upper = payload.status.upper()
    if status_upper in _CLOSED_STATUSES:
        status_weight = _STATUS_WEIGHT_CLOSED
    elif status_upper in _STALLED_STATUSES:
        status_weight = _STATUS_WEIGHT_STALLED
    elif status_upper in _ACTIVE_STATUSES:
        status_weight = _STATUS_WEIGHT_ACTIVE
    else:
        status_weight = _STATUS_WEIGHT_STALLED

    priority_weight = _PRIORITY_WEIGHT.get(priority, 0.1)

    risk_score = time_fraction_elapsed * 0.7 + priority_weight + status_weight

    if remaining_seconds <= 0 and status_upper not in _CLOSED_STATUSES:
        risk_score = max(risk_score, 0.95)

    risk_score = max(0.0, min(1.0, round(risk_score, 4)))

    if status_upper in _CLOSED_STATUSES:
        risk_level = "LOW"
        predicted_breach = False
    elif risk_score >= 0.85:
        risk_level = "CRITICAL"
        predicted_breach = True
    elif risk_score >= 0.65:
        risk_level = "HIGH"
        predicted_breach = True
    elif risk_score >= 0.4:
        risk_level = "MEDIUM"
        predicted_breach = remaining_seconds <= 0
    else:
        risk_level = "LOW"
        predicted_breach = False

    escalation_levels = get_escalation_levels(payload.department)
    if status_upper in _CLOSED_STATUSES:
        recommended_action = "No action needed; grievance is already closed."
    elif risk_level == "CRITICAL":
        recommended_action = (
            f"Immediately escalate to {escalation_levels[-1]}; SLA breach is imminent or has occurred."
        )
    elif risk_level == "HIGH":
        next_level = escalation_levels[min(1, len(escalation_levels) - 1)]
        recommended_action = f"Escalate to {next_level} within the next working day."
    elif risk_level == "MEDIUM":
        recommended_action = "Monitor closely; prompt field action recommended."
    else:
        recommended_action = "No escalation needed; within normal SLA tracking."

    if status_upper in _CLOSED_STATUSES:
        reason = "Grievance status is already closed/resolved, so SLA breach risk is not applicable."
    elif remaining_seconds <= 0:
        reason = "The SLA deadline has already passed while the grievance remains open."
    else:
        reason = (
            f"{round(time_fraction_elapsed * 100)}% of the SLA window has elapsed for a "
            f"{priority} priority grievance currently in '{payload.status}' status."
        )

    return SLARiskResponse(
        grievance_id=payload.grievance_id,
        risk_score=risk_score,
        risk_level=risk_level,
        predicted_breach=predicted_breach,
        remaining_sla_hours=remaining_hours,
        reason=reason,
        recommended_action=recommended_action,
    )
