import os

from dotenv import load_dotenv


load_dotenv()


class Settings:
    # ---------------------------------------------------------
    # Gemini configuration
    # ---------------------------------------------------------

    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "").strip()

    GEMINI_MODEL: str = os.getenv(
        "GEMINI_MODEL",
        "gemini-3.6-flash",
    ).strip()

    # If there is no Gemini API key, use the deterministic
    # fallback engine so the backend can still run.
    AI_FALLBACK_MODE: bool = not bool(GEMINI_API_KEY)

    # ---------------------------------------------------------
    # Duplicate detection
    # ---------------------------------------------------------

    EMBEDDING_MODEL_NAME: str = os.getenv(
        "EMBEDDING_MODEL_NAME",
        "all-MiniLM-L6-v2",
    ).strip()

    DUPLICATE_SIMILARITY_THRESHOLD: float = float(
        os.getenv(
            "DUPLICATE_SIMILARITY_THRESHOLD",
            "0.80",
        )
    )

    DUPLICATE_SIMILARITY_THRESHOLD_TFIDF: float = float(
        os.getenv(
            "DUPLICATE_SIMILARITY_THRESHOLD_TFIDF",
            "0.45",
        )
    )

    # ---------------------------------------------------------
    # Clustering
    # ---------------------------------------------------------

    CLUSTER_SIMILARITY_THRESHOLD: float = float(
        os.getenv(
            "CLUSTER_SIMILARITY_THRESHOLD",
            "0.75",
        )
    )

    CLUSTER_SIMILARITY_THRESHOLD_TFIDF: float = float(
        os.getenv(
            "CLUSTER_SIMILARITY_THRESHOLD_TFIDF",
            "0.35",
        )
    )

    # ---------------------------------------------------------
    # Request timeout
    # ---------------------------------------------------------

    REQUEST_TIMEOUT_SECONDS: float = float(
        os.getenv(
            "REQUEST_TIMEOUT_SECONDS",
            "20",
        )
    )


settings = Settings()