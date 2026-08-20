import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import ValidationError

from app.routes.ai_routes import router as ai_router
from app.schemas.grievance import HealthResponse
from app.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("jansahay")


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.AI_FALLBACK_MODE:
        logger.warning(
            "GEMINI_API_KEY not set — running in deterministic FALLBACK mode. "
            "Set GEMINI_API_KEY in .env to enable real LLM-based classification."
        )
    else:
        logger.info("GEMINI_API_KEY detected — LLM classification path is active.")
    yield


app = FastAPI(
    title="JanSahay AI — Grievance Backend",
    description=(
        "AI backend for citizen grievance understanding, department routing, "
        "priority detection, summarization, and duplicate detection. "
        "Built for SIH260011 — Ministry of Housing and Urban Affairs."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# CORS: allow a future React/Angular frontend to call this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ai_router)


@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    return JSONResponse(status_code=422, content={"detail": exc.errors()})


@app.get("/health", response_model=HealthResponse, tags=["Health"])
def health():
    return HealthResponse(status="UP", service="JanSahay AI Backend")


@app.get("/", tags=["Health"])
def root():
    return {"message": "JanSahay AI Backend is running. See /docs for Swagger UI."}