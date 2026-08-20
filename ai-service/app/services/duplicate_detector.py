import logging
from typing import List, Optional

import numpy as np
from fastapi import HTTPException
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.config import settings
from app.schemas.grievance import DuplicateCheckResponse, ExistingComplaint

logger = logging.getLogger("jansahay.duplicate")

_model = None
_model_load_failed = False


def _get_sentence_transformer():
    """Lazily load the sentence-transformers embedding model.

    Loading is deferred (and cached) so the app can start even if the
    model weights are not yet downloaded/cached. If loading fails (e.g. no
    internet access to download the model on first run), we transparently
    fall back to a TF-IDF + cosine-similarity engine so duplicate detection
    keeps working, just with a less semantic similarity metric.
    """
    global _model, _model_load_failed
    if _model is not None or _model_load_failed:
        return _model
    try:
        from sentence_transformers import SentenceTransformer

        _model = SentenceTransformer(settings.EMBEDDING_MODEL_NAME)
    except Exception as exc:  # noqa: BLE001
        logger.warning(
            "sentence-transformers model '%s' unavailable (%s); "
            "falling back to TF-IDF similarity engine.",
            settings.EMBEDDING_MODEL_NAME,
            exc,
        )
        _model_load_failed = True
        _model = None
    return _model


def _tfidf_similarities(query: str, corpus: List[str]) -> np.ndarray:
    vectorizer = TfidfVectorizer().fit([query] + corpus)
    vectors = vectorizer.transform([query] + corpus)
    sims = cosine_similarity(vectors[0:1], vectors[1:]).flatten()
    return sims


def _embedding_similarities(query: str, corpus: List[str]) -> Optional[np.ndarray]:
    model = _get_sentence_transformer()
    if model is None:
        return None
    try:
        embeddings = model.encode([query] + corpus, normalize_embeddings=True)
        sims = cosine_similarity([embeddings[0]], embeddings[1:]).flatten()
        return sims
    except Exception as exc:  # noqa: BLE001
        logger.error("Embedding inference failed: %s", exc)
        return None


def _tfidf_similarity_matrix(texts: List[str]) -> np.ndarray:
    vectorizer = TfidfVectorizer().fit(texts)
    vectors = vectorizer.transform(texts)
    return cosine_similarity(vectors)


def _embedding_similarity_matrix(texts: List[str]) -> Optional[np.ndarray]:
    model = _get_sentence_transformer()
    if model is None:
        return None
    try:
        embeddings = model.encode(texts, normalize_embeddings=True)
        return cosine_similarity(embeddings)
    except Exception as exc:  # noqa: BLE001
        logger.error("Embedding inference failed: %s", exc)
        return None


def get_similarity_matrix(texts: List[str]) -> tuple[np.ndarray, str]:
    """Public helper reused by both duplicate-check and clustering: returns
    an (N x N) pairwise cosine-similarity matrix for `texts`, using
    sentence-transformer embeddings when available and transparently
    falling back to TF-IDF otherwise. Returns (matrix, engine_name)."""
    if not texts:
        return np.zeros((0, 0)), "none"
    matrix = _embedding_similarity_matrix(texts)
    if matrix is not None:
        return matrix, "sentence-transformers"
    return _tfidf_similarity_matrix(texts), "tfidf-fallback"


def check_duplicate(
    complaint: str, existing_complaints: List[ExistingComplaint]
) -> DuplicateCheckResponse:
    if not complaint or not complaint.strip():
        raise HTTPException(status_code=422, detail="complaint must not be empty.")

    if not existing_complaints:
        return DuplicateCheckResponse(
            is_duplicate=False,
            similarity_score=0.0,
            matched_grievance_id=None,
            message="No existing grievances to compare against.",
        )

    corpus = [c.text for c in existing_complaints]
    ids = [c.id for c in existing_complaints]

    try:
        sims = _embedding_similarities(complaint, corpus)
        engine = "sentence-transformers"
        if sims is None:
            sims = _tfidf_similarities(complaint, corpus)
            engine = "tfidf-fallback"
    except Exception as exc:  # noqa: BLE001
        logger.error("Duplicate detection failed entirely: %s", exc)
        raise HTTPException(status_code=502, detail="Similarity computation failed.")

    best_idx = int(np.argmax(sims))
    best_score = float(sims[best_idx])
    best_id = ids[best_idx]

    threshold = (
        settings.DUPLICATE_SIMILARITY_THRESHOLD_TFIDF
        if engine == "tfidf-fallback"
        else settings.DUPLICATE_SIMILARITY_THRESHOLD
    )
    is_duplicate = best_score >= threshold

    if is_duplicate:
        message = "A similar grievance already exists."
    else:
        message = "No sufficiently similar existing grievance was found."

    logger.info(
        "Duplicate check via %s engine: best_score=%.3f threshold=%.3f",
        engine,
        best_score,
        threshold,
    )

    return DuplicateCheckResponse(
        is_duplicate=is_duplicate,
        similarity_score=round(best_score, 4),
        matched_grievance_id=best_id if is_duplicate else None,
        message=message,
    )
