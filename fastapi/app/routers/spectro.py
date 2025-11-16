from fastapi import APIRouter, UploadFile, File, Form
from io import BytesIO
import numpy as np
import soundfile as sf
from scipy.signal import resample_poly, spectrogram

from ..models.schemas import DomainEnum, SpectrogramResponse
from ..core.config import settings

router = APIRouter()

@router.post("/spectrogram_json", response_model=SpectrogramResponse)
async def spectrogram_json(
    domain: DomainEnum = Form(...),
    file: UploadFile = File(...),
):
    raw = await file.read()

    # Save and load via loaders to support all domains
    import os, tempfile
    from ..services.loaders import load_by_domain

    name = file.filename or "file"
    _, ext = os.path.splitext(name)
    temp = tempfile.NamedTemporaryFile(delete=False, dir=settings.UPLOAD_DIR, suffix=ext or "")
    temp.write(raw); temp.flush(); temp.close()
    try:
        sig, fs, _ = load_by_domain(domain.value, temp.name)
    except Exception:
        # fallback by extension
        ext_l = (os.path.splitext(name.lower())[1])
        if ext_l == ".wav": dom2 = DomainEnum.audio
        elif ext_l == ".edf": dom2 = DomainEnum.eeg
        elif ext_l in (".hdf5", ".h5"): dom2 = DomainEnum.ligo
        elif ext_l == ".nc": dom2 = DomainEnum.grace
        else: dom2 = domain
        sig, fs, _ = load_by_domain(dom2.value, temp.name)
    finally:
        try: os.remove(temp.name)
        except Exception: pass

    sig = np.asarray(sig, dtype=float)
    # domain-specific targets
    target = {
        DomainEnum.audio: int(getattr(settings, "RESAMPLE_AUDIO_HZ", 16000)),
        DomainEnum.eeg: int(getattr(settings, "RESAMPLE_EEG_HZ", 128)),
        DomainEnum.ligo: 1024,
        DomainEnum.grace: 64,
    }.get(domain, min(int(fs), 1024))
    if int(fs) > target and target > 0:
        sig = resample_poly(sig, target, int(fs)); fs = float(target)
    else:
        fs = float(fs)

    nperseg = max(64, min(1024, len(sig)//8 or 64))
    f, t, Sxx = spectrogram(sig, fs=fs, nperseg=nperseg, noverlap=nperseg//2)
    Sxx = np.maximum(Sxx, 1e-18)
    max_bins = 256
    f_step = max(1, int(np.ceil(len(f)/max_bins)))
    t_step = max(1, int(np.ceil(len(t)/max_bins)))
    f_ds = f[::f_step]
    t_ds = t[::t_step]
    S_ds = Sxx[::f_step, ::t_step]
    Sxx_db = (10.0 * np.log10(S_ds)).tolist()

    mean_spec = np.mean(S_ds, axis=1)
    ct = float(np.sum(f_ds * mean_spec) / np.sum(mean_spec)) if mean_spec.size else 0.0

    return SpectrogramResponse(
        t=t_ds.tolist(),
        f=f_ds.tolist(),
        sxx_db=Sxx_db,
        ct=ct,
        meta={"fs": fs, "name": name},
    )
