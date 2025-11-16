from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import json
import os
from pathlib import Path

_HERE = Path(__file__).resolve().parent
_DEFAULT_PARAMS = _HERE.parent / "services" / "params_45R4.json"


class Settings(BaseSettings):
    APP_NAME: str = "Phase-45R4 API"
    API_PREFIX: str = "/api/v1"
    CORS_ORIGINS: str = "*"          # comma-separated, or "*"
    UPLOAD_DIR: str = "_uploads"
    RESAMPLE_AUDIO_HZ: int = 16000
    RESAMPLE_EEG_HZ: int = 128
    DEFAULT_LIGO_FS: int = 4096
    DEFAULT_GRACE_FS: int = 100
    MODEL_PARAMS_FILE: str = str(_DEFAULT_PARAMS)
    MAX_LIGO_SAMPLES: int = 2_000_000
    MAX_GRACE_TIMESTEPS: int = 10000

    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="",
        case_sensitive=False,
    )

    @property
    def cors_origins(self) -> List[str]:
        s = (self.CORS_ORIGINS or "").strip()
        if s in ("", "*"):
            return ["*"]
        # Support JSON-style list or comma-separated list
        try:
            if s.startswith("["):
                arr = json.loads(s)
                return [str(x).strip() for x in arr if str(x).strip()]
        except Exception:
            pass
        return [x.strip() for x in s.split(",") if x.strip()]

settings = Settings()
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
