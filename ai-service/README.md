# JanSahay AI — Grievance Backend

AI backend prototype for **SIH260011** (Ministry of Housing and Urban Affairs) —
*"Suggest an AI-based solution to enable ease of grievance lodging and tracking
for citizens across multiple departments."*

## What it does

- **POST /api/ai/analyze** — classifies a raw citizen complaint into
  category / sub-category / department, detects priority (LOW → CRITICAL),
  generates a short admin summary, and returns a confidence score.
- **POST /api/ai/check-duplicate** — compares a new complaint against a list
  of existing complaints using semantic embedding similarity and flags
  likely duplicates.
- **POST /api/ai/explain-status** — converts an internal grievance status +
  officer remarks into a short citizen-friendly message.
- **GET /health** — service health check.

## AI engines used

| Feature | Primary engine | Fallback (no key / no model) |
| Analyze / Explain-status | OpenAI Chat Completions (`OPENAI_MODEL`, default `gpt-4o-mini`) | Deterministic keyword-rule classifier |
| Duplicate detection | `sentence-transformers` (`all-MiniLM-L6-v2`) embeddings + cosine similarity | TF-IDF + cosine similarity (scikit-learn) |
| Priority | LLM/keyword proposal, escalated by deterministic public-safety regex rules (never downgraded) | same |

The service **always runs**, even with no `OPENAI_API_KEY` and no internet
access to download the embedding model — it transparently drops into the
fallback engines so it can be started and demoed anywhere. Every response's
`reason` field says when the fallback classifier was used. Server logs state
which mode is active on startup.

For the full LLM + embedding pipeline described in the problem statement,
set a real `OPENAI_API_KEY` (the embedding model auto-downloads from
Hugging Face on first use, so that machine needs normal internet access).

## Department taxonomy

Fixed, configurable in `app/data/departments.py`. The AI is constrained to
this list via the prompt, and any invalid/hallucinated department or
sub-category returned by the LLM is repaired against this taxonomy before
the API responds — the department name can never be invented.

Departments: Roads, Water Supply, Sewerage, Solid Waste Management,
Street Lighting, Parks and Horticulture, Building and Town Planning,
Public Health.

## Run it

```bash
cd ai-service
python3 -m venv venv && source venv/bin/activate   # optional but recommended
pip install -r requirements.txt
cp .env.example .env      # then edit .env and add your OPENAI_API_KEY (optional)
uvicorn app.main:app --reload
```

Open Swagger UI: **http://localhost:8000/docs**

## Run tests

```bash
pytest tests/ -v
```

## Example request

```bash
curl -X POST http://localhost:8000/api/ai/analyze \
  -H "Content-Type: application/json" \
  -d '{"complaint": "There is a huge pothole near my apartment. It has been there for 10 days and two people almost fell yesterday.", "latitude": 12.9716, "longitude": 77.5946}'
```

## Notes on the department naming in the problem statement's example

The problem statement's sample response uses `"department": "Municipal Roads"`
while section 2 of the same brief defines the fixed department list as
`"Roads"` (no "Municipal" prefix). Since section 2 explicitly states *"The AI
MUST NOT invent department names"* and gives the authoritative 8-department
list, this implementation treats that list as the source of truth and
returns `"Roads"`, `"Water Supply"`, etc. Rename entries in
`app/data/departments.py` if your jury/demo expects the "Municipal X" style
names instead.

## Error handling

All of the following return meaningful HTTP status codes with a JSON
`detail` message instead of crashing: missing/empty complaint (422), LLM
timeout (504), LLM provider error (502), invalid/unparseable LLM JSON (502,
auto-repaired against the taxonomy where possible), embedding failure
(automatic TF-IDF fallback, or 502 if that also fails), invalid
priority/department from the LLM (auto-corrected), unexpected server errors
(500).
