from pydantic import BaseModel, Field
from enum import Enum
from typing import List, Optional

class DomainEnum(str, Enum):
    audio = "audio"
    eeg   = "eeg"
    ligo  = "ligo"
    grace = "grace"

class FileResult(BaseModel):
    name: str
    domain: str
    fs: float
    ct_proxy: float
    ct_pred: float | None = None
    energy: float
    noise: float
    gamma: float
    beta: float
    lam: float
    dom: float
    cen: float
    bw: float
    drop_ratio: float | None = None
    rf_ct: float | None = None
    kitab_ct: float
    kitab_lo: float | None = None
    kitab_hi: float | None = None
    delta_ct: float | None = None
    error: bool = False
    error_message: str | None = None

class PredictResponse(BaseModel):
    results: List[FileResult]
    r2: Optional[float] = None
    mae: Optional[float] = None
    per_domain: Optional[List[dict]] = None
    delta_mean: Optional[float] = None
    zip_base64: Optional[str] = None
    zip_filename: Optional[str] = None

class SpectrogramResponse(BaseModel):
    t: list[float]
    f: list[float]
    sxx_db: list[list[float]]
    ct: float
    meta: dict = Field(default_factory=dict)

class SurfacePoint(BaseModel):
    gamma: float
    energy: float
    ct: float

class SurfaceResponse(BaseModel):
    points: List[SurfacePoint]
