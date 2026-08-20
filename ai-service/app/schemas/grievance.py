from typing import List, Optional
from pydantic import BaseModel, Field, field_validator

from app.data.departments import VALID_DEPARTMENTS, VALID_PRIORITIES


# ---------------------------------------------------------------------------
# /api/ai/analyze
# ---------------------------------------------------------------------------

class GrievanceAnalyzeRequest(BaseModel):
    complaint: str = Field(..., min_length=1, description="Raw citizen complaint text")
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    language: Optional[str] = Field(
        None,
        description=(
            "ISO 639-1 language code of the complaint text, e.g. 'en', 'hi', 'kn'. "
            "If omitted, the service auto-detects it."
        ),
    )

    @field_validator("complaint")
    @classmethod
    def complaint_not_blank(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("complaint must not be empty or whitespace-only")
        return v.strip()


class LocationContext(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class GrievanceAnalyzeResponse(BaseModel):
    category: str
    sub_category: str
    issue: str
    department: str
    priority: str
    summary: str
    location: Optional[str] = None
    duration: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    confidence: float = Field(..., ge=0.0, le=1.0)
    reason: str
    language: str = "en"
    language_name: str = "English"
    location_context: LocationContext

    @field_validator("department")
    @classmethod
    def department_must_be_valid(cls, v: str) -> str:
        if v not in VALID_DEPARTMENTS:
            raise ValueError(f"Invalid department returned: {v}")
        return v

    @field_validator("priority")
    @classmethod
    def priority_must_be_valid(cls, v: str) -> str:
        if v not in VALID_PRIORITIES:
            raise ValueError(f"Invalid priority returned: {v}")
        return v


# ---------------------------------------------------------------------------
# /api/ai/check-duplicate
# ---------------------------------------------------------------------------

class ExistingComplaint(BaseModel):
    id: str
    text: str = Field(..., min_length=1)


class DuplicateCheckRequest(BaseModel):
    complaint: str = Field(..., min_length=1)
    existing_complaints: List[ExistingComplaint] = Field(default_factory=list)

    @field_validator("complaint")
    @classmethod
    def complaint_not_blank(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("complaint must not be empty or whitespace-only")
        return v.strip()


class DuplicateCheckResponse(BaseModel):
    is_duplicate: bool
    similarity_score: float = Field(..., ge=0.0, le=1.0)
    matched_grievance_id: Optional[str] = None
    message: str


# ---------------------------------------------------------------------------
# /api/ai/explain-status
# ---------------------------------------------------------------------------

class StatusExplainRequest(BaseModel):
    status: str = Field(..., min_length=1)
    department: str = Field(..., min_length=1)
    remarks: str = Field(default="")


class StatusExplainResponse(BaseModel):
    citizen_message: str


# ---------------------------------------------------------------------------
# /api/ai/cluster
# ---------------------------------------------------------------------------

class ClusterComplaintInput(BaseModel):
    id: str
    text: str = Field(..., min_length=1)


class ClusterRequest(BaseModel):
    complaints: List[ClusterComplaintInput] = Field(..., min_length=1)
    similarity_threshold: Optional[float] = Field(
        None, ge=0.0, le=1.0,
        description="Override the default clustering similarity threshold.",
    )


class Cluster(BaseModel):
    cluster_id: str
    grievance_ids: List[str]
    similarity_scores: dict = Field(
        description="Pairwise similarity of each member to the cluster's representative complaint."
    )
    common_issue_summary: str
    category: Optional[str] = None
    location: Optional[str] = None


class ClusterResponse(BaseModel):
    clusters: List[Cluster]
    unclustered_ids: List[str] = Field(
        default_factory=list,
        description="IDs that did not match any other complaint closely enough to form a cluster.",
    )
    engine_used: str


# ---------------------------------------------------------------------------
# /api/ai/predict-sla-risk
# ---------------------------------------------------------------------------

class SLARiskRequest(BaseModel):
    grievance_id: str = Field(..., min_length=1)
    category: str = Field(..., min_length=1)
    priority: str = Field(..., min_length=1)
    status: str = Field(..., min_length=1)
    created_at: str = Field(..., description="ISO 8601 datetime")
    sla_deadline: Optional[str] = Field(None, description="ISO 8601 datetime; computed from department SLA if omitted")
    current_time: Optional[str] = Field(None, description="ISO 8601 datetime; defaults to server 'now' if omitted")
    days_elapsed: Optional[float] = None
    department: str = Field(..., min_length=1)


class SLARiskResponse(BaseModel):
    grievance_id: str
    risk_score: float = Field(..., ge=0.0, le=1.0)
    risk_level: str
    predicted_breach: bool
    remaining_sla_hours: float
    reason: str
    recommended_action: str


# ---------------------------------------------------------------------------
# /api/ai/detect-language
# ---------------------------------------------------------------------------

class LanguageDetectRequest(BaseModel):
    text: str = Field(..., min_length=1)

    @field_validator("text")
    @classmethod
    def text_not_blank(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("text must not be empty or whitespace-only")
        return v.strip()


class LanguageDetectResponse(BaseModel):
    language: str
    language_name: str
    confidence: float = Field(..., ge=0.0, le=1.0)


# ---------------------------------------------------------------------------
# /api/ai/transcribe
# ---------------------------------------------------------------------------

class TranscribeResponse(BaseModel):
    language: str
    language_name: str
    transcript: str


# ---------------------------------------------------------------------------
# Misc
# ---------------------------------------------------------------------------

class HealthResponse(BaseModel):
    status: str
    service: str
