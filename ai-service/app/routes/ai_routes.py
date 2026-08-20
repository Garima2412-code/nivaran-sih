import logging

from fastapi import APIRouter, HTTPException, UploadFile, File

from app.schemas.grievance import (
    GrievanceAnalyzeRequest,
    GrievanceAnalyzeResponse,
    DuplicateCheckRequest,
    DuplicateCheckResponse,
    StatusExplainRequest,
    StatusExplainResponse,
    ClusterRequest,
    ClusterResponse,
    SLARiskRequest,
    SLARiskResponse,
    LanguageDetectRequest,
    LanguageDetectResponse,
    TranscribeResponse,
)

from app.services.grievance_analyzer import analyze_grievance
from app.services.duplicate_detector import check_duplicate
from app.services.status_explainer import explain_status
from app.services.clustering_service import cluster_complaints
from app.services.sla_predictor import predict_sla_risk
from app.services.language_service import detect_language, language_name
from app.services.transcription_service import transcribe_audio

logger = logging.getLogger("jansahay.routes")

router = APIRouter(prefix="/api/ai", tags=["AI Grievance Engine"])


@router.post("/analyze", response_model=GrievanceAnalyzeResponse)
def analyze(payload: GrievanceAnalyzeRequest):
    """Classify a citizen grievance: category, sub-category, department,
    priority, summary, extracted entities (issue/location/duration),
    language, and confidence.
    """
    try:
        return analyze_grievance(
            payload.complaint,
            payload.latitude,
            payload.longitude,
            payload.language,
        )
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        logger.exception("Unexpected error in /analyze")
        raise HTTPException(
            status_code=500,
            detail=f"Internal analysis error: {exc}",
        )


@router.post("/check-duplicate", response_model=DuplicateCheckResponse)
def check_duplicate_route(payload: DuplicateCheckRequest):
    """Compare a new complaint against a list of existing complaints using
    embedding similarity and flag likely duplicates.
    """
    try:
        return check_duplicate(
            payload.complaint,
            payload.existing_complaints,
        )
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        logger.exception("Unexpected error in /check-duplicate")
        raise HTTPException(
            status_code=500,
            detail=f"Internal duplicate-check error: {exc}",
        )


@router.post("/cluster", response_model=ClusterResponse)
def cluster_route(payload: ClusterRequest):
    """Group multiple semantically similar complaints into common issue
    clusters using embedding/vector similarity (connected components over
    the pairwise similarity graph, not exact string matching).
    """
    try:
        return cluster_complaints(
            payload.complaints,
            payload.similarity_threshold,
        )
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        logger.exception("Unexpected error in /cluster")
        raise HTTPException(
            status_code=500,
            detail=f"Internal clustering error: {exc}",
        )


@router.post("/predict-sla-risk", response_model=SLARiskResponse)
def predict_sla_risk_route(payload: SLARiskRequest):
    """Transparent, deterministic rule-based SLA breach-risk scoring based
    on elapsed/remaining time, priority, status, and department SLA
    configuration. Not a trained ML model — see README for details.
    """
    try:
        return predict_sla_risk(payload)
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        logger.exception("Unexpected error in /predict-sla-risk")
        raise HTTPException(
            status_code=500,
            detail=f"Internal SLA-prediction error: {exc}",
        )


@router.post("/explain-status", response_model=StatusExplainResponse)
def explain_status_route(payload: StatusExplainRequest):
    """Convert an internal grievance status/remarks pair into a short
    citizen-friendly explanation.
    """
    try:
        return explain_status(
            payload.status,
            payload.department,
            payload.remarks,
        )
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        logger.exception("Unexpected error in /explain-status")
        raise HTTPException(
            status_code=500,
            detail=f"Internal status-explain error: {exc}",
        )


@router.post("/detect-language", response_model=LanguageDetectResponse)
def detect_language_route(payload: LanguageDetectRequest):
    """Detect the language of a piece of citizen-submitted text (offline,
    no external API required).
    """
    try:
        code, confidence = detect_language(payload.text)

        return LanguageDetectResponse(
            language=code,
            language_name=language_name(code),
            confidence=confidence,
        )
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        logger.exception("Unexpected error in /detect-language")
        raise HTTPException(
            status_code=500,
            detail=f"Internal language-detection error: {exc}",
        )


@router.post("/transcribe", response_model=TranscribeResponse)
async def transcribe_route(file: UploadFile = File(...)):
    """Transcribe an uploaded audio file to text.
    Returns 503 gracefully if the configured transcription service
    is unavailable.

    The resulting transcript can be passed straight into
    /api/ai/analyze.
    """
    try:
        return await transcribe_audio(file)
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        logger.exception("Unexpected error in /transcribe")
        raise HTTPException(
            status_code=500,
            detail=f"Internal transcription error: {exc}",
        )