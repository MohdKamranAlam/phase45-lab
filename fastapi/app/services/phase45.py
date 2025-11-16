import json
from typing import Dict

import numpy as np

from ..core.config import settings
from .loaders import load_by_domain
from .features import (
    collapse_proxy_time,
    compute_features,
    energy_drop_ratio,
)


def run_phase45(domain: str, path: str) -> Dict[str, float]:
    """Load a file, compute ψ-features, and return rich sample data."""
    sig, fs, meta = load_by_domain(domain, path)
    window, env, feat, vec = compute_features(domain, sig, fs)
    ct = collapse_proxy_time(env, fs)
    drop = energy_drop_ratio(env, fs, ct)

    feat.update(
        {
            "name": meta.get("name", meta.get("filename", "file")),
            "fs": float(fs),
            "ct_proxy": float(ct),
            "drop_ratio": float(drop),
        }
    )
    return {
        "name": feat["name"],
        "domain": domain,
        "fs": float(fs),
        "features": feat,
        "vector": vec,
        "window": window,
        "env": env,
    }


__all__ = ["run_phase45"]
