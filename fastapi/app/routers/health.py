from datetime import datetime
import os

from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
def health():
    return {
        "ok": True,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "version": os.getenv("APP_VERSION", "unknown"),
    }
