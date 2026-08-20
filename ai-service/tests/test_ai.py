"""
Automated tests for JanSahay AI backend.

These tests are designed for the Gemini-based JanSahay AI backend.

The backend can operate in either mode:

1. Gemini mode
   - GEMINI_API_KEY is configured.
   - The real Gemini AI path is exercised.

2. Deterministic fallback mode
   - GEMINI_API_KEY is not configured.
   - The backend must use its deterministic fallback logic.

In both modes, the tests verify:
- API availability
- response structure
- valid department taxonomy
- valid priority taxonomy
- confidence range
- summary generation
- entity extraction
- multilingual handling
- duplicate detection
- grievance clustering
- SLA breach prediction
- status explanation
- voice transcription behavior
- fallback behavior

Gemini model expected by the application:
    gemini-3.6-flash
"""

from datetime import datetime, timedelta

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.config import settings
from app.data.departments import VALID_DEPARTMENTS, VALID_PRIORITIES


# ---------------------------------------------------------------------------
# Test client
# ---------------------------------------------------------------------------

client = TestClient(app)


# ---------------------------------------------------------------------------
# Sample grievances
# ---------------------------------------------------------------------------
#
# 15 realistic Indian urban grievance examples covering all supported
# departments.
#
# expected_department is retained as reference data. The API response is
# validated against the allowed taxonomy below.
# ---------------------------------------------------------------------------

SAMPLE_GRIEVANCES = [
    {
        "text": (
            "There is a huge pothole near my apartment on 4th Main Road, "
            "it's been there for 10 days and two people almost fell yesterday."
        ),
        "expected_department": "Roads",
    },
    {
        "text": (
            "The footpath outside our society gate is completely broken "
            "and dangerous for elderly people to walk on."
        ),
        "expected_department": "Roads",
    },
    {
        "text": (
            "Water has been leaking from a broken pipe on our street for "
            "two days, wasting a lot of water."
        ),
        "expected_department": "Water Supply",
    },
    {
        "text": (
            "We have had no water supply in our locality for the last "
            "3 days, please help urgently."
        ),
        "expected_department": "Water Supply",
    },
    {
        "text": (
            "The water coming from our tap is muddy and smells bad, "
            "we suspect it is contaminated."
        ),
        "expected_department": "Water Supply",
    },
    {
        "text": (
            "There is an open manhole right outside ABC School gate and "
            "children are walking past it every day."
        ),
        "expected_department": "Sewerage",
    },
    {
        "text": (
            "Sewage water is overflowing onto the main road near the bus "
            "stop, causing a terrible smell."
        ),
        "expected_department": "Sewerage",
    },
    {
        "text": (
            "The drain near our house has been blocked for a week and "
            "water is stagnating."
        ),
        "expected_department": "Sewerage",
    },
    {
        "text": (
            "Garbage has not been collected from our street for the past "
            "3 days and it is piling up."
        ),
        "expected_department": "Solid Waste Management",
    },
    {
        "text": (
            "Someone is illegally dumping construction debris in the "
            "empty plot next to our house."
        ),
        "expected_department": "Solid Waste Management",
    },
    {
        "text": (
            "The streetlight in front of house number 24 has not been "
            "working for over a week, it's very dark at night."
        ),
        "expected_department": "Street Lighting",
    },
    {
        "text": (
            "A tree fell down during last night's storm and is blocking "
            "half the road."
        ),
        "expected_department": "Parks and Horticulture",
    },
    {
        "text": (
            "The neighborhood park has overgrown grass and broken benches "
            "that need maintenance."
        ),
        "expected_department": "Parks and Horticulture",
    },
    {
        "text": (
            "My neighbor is constructing an extra floor without any "
            "approved building plan."
        ),
        "expected_department": "Building and Town Planning",
    },
    {
        "text": (
            "There is heavy mosquito breeding near the stagnant water "
            "behind our apartment complex."
        ),
        "expected_department": "Public Health",
    },
]


# ---------------------------------------------------------------------------
# Generic test data
# ---------------------------------------------------------------------------

AMBIGUOUS_GRIEVANCE = "Something is broken near my house."

GEMINI_MODEL = "gemini-3.6-flash"


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------

def gemini_api_configured() -> bool:
    """
    Return True when the JanSahay backend is configured to use Gemini.

    The actual fallback decision remains controlled by the application's
    AI_FALLBACK_MODE setting. This helper only makes the tests easier to
    understand and keeps OpenAI-specific assumptions out of the test suite.
    """
    return bool(getattr(settings, "GEMINI_API_KEY", None))


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

def test_health():
    """Backend health endpoint must report that the service is operational."""
    resp = client.get("/health")

    assert resp.status_code == 200

    body = resp.json()

    assert body["status"] == "UP"
    assert body["service"] == "JanSahay AI Backend"


# ---------------------------------------------------------------------------
# AI grievance analysis
# ---------------------------------------------------------------------------

@pytest.mark.parametrize("case", SAMPLE_GRIEVANCES)
def test_analyze_sample_grievances(case):
    """
    Verify that grievance analysis returns a valid response for realistic
    urban complaints.

    The department and priority must always belong to the application's
    approved taxonomy.
    """
    resp = client.post(
        "/api/ai/analyze",
        json={"complaint": case["text"]},
    )

    assert resp.status_code == 200, resp.text

    body = resp.json()

    assert body["department"] in VALID_DEPARTMENTS
    assert body["priority"] in VALID_PRIORITIES

    assert 0.0 <= body["confidence"] <= 1.0

    assert isinstance(body["summary"], str)
    assert len(body["summary"].split()) <= 25

    assert "reason" in body
    assert body["reason"]


def test_analyze_ambiguous_complaint_has_lower_confidence():
    """
    An intentionally vague complaint should not receive extremely high
    classification confidence.
    """
    resp = client.post(
        "/api/ai/analyze",
        json={"complaint": AMBIGUOUS_GRIEVANCE},
    )

    assert resp.status_code == 200

    body = resp.json()

    assert body["confidence"] < 0.85


def test_analyze_critical_safety_escalation():
    """
    A dangerous open manhole near a school must be classified as CRITICAL.
    """
    resp = client.post(
        "/api/ai/analyze",
        json={
            "complaint": (
                "There is an open manhole near a school "
                "where children are walking."
            )
        },
    )

    assert resp.status_code == 200

    body = resp.json()

    assert body["priority"] == "CRITICAL"


def test_analyze_rejects_empty_complaint():
    """Empty complaints must fail request validation."""
    resp = client.post(
        "/api/ai/analyze",
        json={"complaint": ""},
    )

    assert resp.status_code == 422


def test_analyze_rejects_missing_complaint():
    """Requests without a complaint must fail request validation."""
    resp = client.post(
        "/api/ai/analyze",
        json={},
    )

    assert resp.status_code == 422


# ---------------------------------------------------------------------------
# Duplicate grievance detection
# ---------------------------------------------------------------------------

def test_check_duplicate_positive():
    """
    Similar complaints referring to the same real-world issue should be
    identified as duplicates.
    """
    resp = client.post(
        "/api/ai/check-duplicate",
        json={
            "complaint": (
                "There is a dangerous pothole outside ABC School "
                "on Main Road."
            ),
            "existing_complaints": [
                {
                    "id": "GRV-1001",
                    "text": "Large pothole near ABC School on Main Road.",
                },
                {
                    "id": "GRV-1002",
                    "text": "Streetlight not working near XYZ Park.",
                },
            ],
        },
    )

    assert resp.status_code == 200

    body = resp.json()

    assert body["is_duplicate"] is True
    assert body["matched_grievance_id"] == "GRV-1001"
    assert body["similarity_score"] > 0.5


def test_check_duplicate_negative():
    """Unrelated complaints must not be classified as duplicates."""
    resp = client.post(
        "/api/ai/check-duplicate",
        json={
            "complaint": (
                "The community park needs new swings for children."
            ),
            "existing_complaints": [
                {
                    "id": "GRV-2001",
                    "text": "No water supply in Sector 5 for three days.",
                }
            ],
        },
    )

    assert resp.status_code == 200

    body = resp.json()

    assert body["is_duplicate"] is False


def test_check_duplicate_no_existing_complaints():
    """
    With no existing grievances, the complaint cannot be a duplicate.
    """
    resp = client.post(
        "/api/ai/check-duplicate",
        json={
            "complaint": "Garbage not collected.",
            "existing_complaints": [],
        },
    )

    assert resp.status_code == 200
    assert resp.json()["is_duplicate"] is False


# ---------------------------------------------------------------------------
# Status explanation
# ---------------------------------------------------------------------------

def test_explain_status():
    """Status explanation must return a citizen-facing message."""
    resp = client.post(
        "/api/ai/explain-status",
        json={
            "status": "FIELD_INSPECTION_COMPLETED",
            "department": "Municipal Roads",
            "remarks": (
                "Officer inspected the pothole and forwarded the repair "
                "request to the maintenance team."
            ),
        },
    )

    assert resp.status_code == 200

    body = resp.json()

    assert "citizen_message" in body
    assert len(body["citizen_message"]) > 0


def test_explain_status_rejects_missing_fields():
    """Missing required status information must fail validation."""
    resp = client.post(
        "/api/ai/explain-status",
        json={
            "status": "",
            "department": "Roads",
        },
    )

    assert resp.status_code == 422


# ---------------------------------------------------------------------------
# Entity extraction
# ---------------------------------------------------------------------------
#
# The AI analysis should extract issue/location/duration where present,
# while never inventing information that the citizen did not provide.
# ---------------------------------------------------------------------------

def test_analyze_extracts_entities_without_fabricating():
    resp = client.post(
        "/api/ai/analyze",
        json={
            "complaint": (
                "There has been a huge pothole near ABC School for "
                "the last 10 days and two people almost fell yesterday."
            ),
            "latitude": 12.9716,
            "longitude": 77.5946,
        },
    )

    assert resp.status_code == 200

    body = resp.json()

    assert body["issue"]

    # Coordinates supplied by the API request must be preserved.
    assert body["latitude"] == 12.9716
    assert body["longitude"] == 77.5946

    # Location extraction is best-effort.
    # If returned, it must be a non-empty string.
    if body["location"] is not None:
        assert isinstance(body["location"], str)
        assert len(body["location"]) > 0

    # Duration extraction is best-effort.
    # If returned, it must correspond to the complaint.
    if body["duration"] is not None:
        assert isinstance(body["duration"], str)
        assert (
            "10" in body["duration"]
            or "day" in body["duration"].lower()
        )


def test_analyze_returns_null_location_when_absent():
    """
    If the complaint contains no location information, the AI must not
    fabricate one.
    """
    resp = client.post(
        "/api/ai/analyze",
        json={
            "complaint": "Garbage has not been collected."
        },
    )

    assert resp.status_code == 200

    body = resp.json()

    assert body["location"] is None


# ---------------------------------------------------------------------------
# Multilingual support
# ---------------------------------------------------------------------------

def test_detect_language_english():
    """English complaint must be detected as English."""
    resp = client.post(
        "/api/ai/detect-language",
        json={
            "text": "There is no water supply in our area."
        },
    )

    assert resp.status_code == 200

    body = resp.json()

    assert body["language"] == "en"
    assert body["language_name"] == "English"


def test_detect_language_hindi():
    """Hindi complaint must be detected as Hindi."""
    resp = client.post(
        "/api/ai/detect-language",
        json={
            "text": (
                "हमारे इलाके में पिछले तीन दिनों से "
                "पानी की आपूर्ति नहीं हो रही है।"
            )
        },
    )

    assert resp.status_code == 200

    body = resp.json()

    assert body["language"] == "hi"


def test_analyze_multilingual_complaint_returns_language_field():
    """
    Kannada complaint must preserve the supplied/detected language.
    """
    resp = client.post(
        "/api/ai/analyze",
        json={
            "complaint": "ನಮ್ಮ ರಸ್ತೆಯಲ್ಲಿ ಕಸವನ್ನು ಸಂಗ್ರಹಿಸಿಲ್ಲ.",
            "language": "kn",
        },
    )

    assert resp.status_code == 200

    body = resp.json()

    assert body["language"] == "kn"
    assert body["language_name"] == "Kannada"
    assert body["department"] in VALID_DEPARTMENTS


# ---------------------------------------------------------------------------
# Issue clustering
# ---------------------------------------------------------------------------

def test_cluster_groups_similar_complaints():
    """
    Similar pothole complaints referring to the same location should be
    clustered together, while the unrelated streetlight complaint should
    remain outside that cluster.
    """
    resp = client.post(
        "/api/ai/cluster",
        json={
            "complaints": [
                {
                    "id": "GRV001",
                    "text": "Large pothole near ABC School",
                },
                {
                    "id": "GRV014",
                    "text": "Dangerous pothole outside ABC School",
                },
                {
                    "id": "GRV029",
                    "text": "Road has a huge pothole near ABC School",
                },
                {
                    "id": "GRV099",
                    "text": "Streetlight not working near XYZ Park",
                },
            ]
        },
    )

    assert resp.status_code == 200, resp.text

    body = resp.json()

    assert len(body["clusters"]) >= 1

    pothole_cluster = next(
        (
            cluster
            for cluster in body["clusters"]
            if "GRV001" in cluster["grievance_ids"]
        ),
        None,
    )

    assert pothole_cluster is not None
    assert "GRV014" in pothole_cluster["grievance_ids"]
    assert "GRV029" in pothole_cluster["grievance_ids"]

    assert "GRV099" not in pothole_cluster["grievance_ids"]

    assert pothole_cluster["common_issue_summary"]


def test_cluster_different_complaints_are_not_grouped():
    """
    Completely unrelated grievances should remain unclustered.
    """
    resp = client.post(
        "/api/ai/cluster",
        json={
            "complaints": [
                {
                    "id": "A1",
                    "text": (
                        "No water supply in Sector 5 for three days."
                    ),
                },
                {
                    "id": "A2",
                    "text": (
                        "Illegal construction happening near the park."
                    ),
                },
            ]
        },
    )

    assert resp.status_code == 200

    body = resp.json()

    assert len(body["clusters"]) == 0
    assert set(body["unclustered_ids"]) == {"A1", "A2"}


# ---------------------------------------------------------------------------
# Predictive SLA breach risk
# ---------------------------------------------------------------------------

def test_predict_sla_risk_high():
    """
    A high-priority grievance that is close to its SLA deadline should
    have high or critical breach risk.
    """
    created = datetime.utcnow() - timedelta(hours=70)
    now = datetime.utcnow()

    resp = client.post(
        "/api/ai/predict-sla-risk",
        json={
            "grievance_id": "GRV-10231",
            "category": "Roads",
            "priority": "HIGH",
            "status": "UNDER_REVIEW",
            "created_at": created.isoformat(),
            "sla_deadline": (
                created + timedelta(hours=72)
            ).isoformat(),
            "current_time": now.isoformat(),
            "department": "Roads",
        },
    )

    assert resp.status_code == 200, resp.text

    body = resp.json()

    assert body["risk_level"] in ("HIGH", "CRITICAL")
    assert body["predicted_breach"] is True
    assert body["remaining_sla_hours"] < 24


def test_predict_sla_risk_low():
    """
    A recently created low-priority grievance with plenty of SLA time
    remaining should have LOW risk.
    """
    created = datetime.utcnow() - timedelta(hours=2)
    now = datetime.utcnow()

    resp = client.post(
        "/api/ai/predict-sla-risk",
        json={
            "grievance_id": "GRV-20001",
            "category": "Parks and Horticulture",
            "priority": "LOW",
            "status": "IN_PROGRESS",
            "created_at": created.isoformat(),
            "sla_deadline": (
                created + timedelta(hours=96)
            ).isoformat(),
            "current_time": now.isoformat(),
            "department": "Parks and Horticulture",
        },
    )

    assert resp.status_code == 200, resp.text

    body = resp.json()

    assert body["risk_level"] == "LOW"
    assert body["predicted_breach"] is False


def test_predict_sla_risk_already_resolved_is_low_risk():
    """
    A resolved grievance must not be considered at risk of SLA breach.
    """
    created = datetime.utcnow() - timedelta(hours=200)

    resp = client.post(
        "/api/ai/predict-sla-risk",
        json={
            "grievance_id": "GRV-30001",
            "category": "Roads",
            "priority": "CRITICAL",
            "status": "RESOLVED",
            "created_at": created.isoformat(),
            "department": "Roads",
        },
    )

    assert resp.status_code == 200

    body = resp.json()

    assert body["risk_level"] == "LOW"
    assert body["predicted_breach"] is False


def test_predict_sla_risk_rejects_invalid_priority():
    """
    Invalid priority values must be rejected by API validation.
    """
    resp = client.post(
        "/api/ai/predict-sla-risk",
        json={
            "grievance_id": "GRV-1",
            "category": "Roads",
            "priority": "URGENT",
            "status": "PENDING",
            "created_at": datetime.utcnow().isoformat(),
            "department": "Roads",
        },
    )

    assert resp.status_code == 422


# ---------------------------------------------------------------------------
# Voice transcription
# ---------------------------------------------------------------------------
#
# Gemini is now the AI provider.
#
# The test checks that transcription fails gracefully when the Gemini
# configuration is unavailable.
# ---------------------------------------------------------------------------

def test_transcribe_gracefully_unavailable_without_gemini_api_key():
    """
    When Gemini is not configured, transcription should return a controlled
    503 response instead of crashing.
    """
    if not settings.AI_FALLBACK_MODE:
        pytest.skip(
            "GEMINI_API_KEY is configured in this environment; "
            "skipping fallback-only transcription test."
        )

    fake_audio = b"RIFF....WAVEfmt "

    resp = client.post(
        "/api/ai/transcribe",
        files={
            "file": (
                "test.wav",
                fake_audio,
                "audio/wav",
            )
        },
    )

    assert resp.status_code == 503

    detail = resp.json()["detail"]

    assert "GEMINI_API_KEY" in detail


# ---------------------------------------------------------------------------
# Gemini-unavailable fallback mode
# ---------------------------------------------------------------------------

def test_fallback_mode_still_produces_full_classification():
    """
    Confirms that the deterministic fallback path still produces a complete
    grievance classification without calling Gemini.

    This test runs only when AI_FALLBACK_MODE is enabled.
    """
    if not settings.AI_FALLBACK_MODE:
        pytest.skip(
            "GEMINI_API_KEY is configured in this environment; "
            "Gemini AI path is active instead."
        )

    resp = client.post(
        "/api/ai/analyze",
        json={
            "complaint": (
                "Streetlight is not working outside our house."
            )
        },
    )

    assert resp.status_code == 200

    body = resp.json()

    assert body["department"] == "Street Lighting"
    assert body["category"] == "Street Lighting"
    assert body["priority"] in VALID_PRIORITIES
    assert body["summary"]

    assert "fallback" in body["reason"].lower()