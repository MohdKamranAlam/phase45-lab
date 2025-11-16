# app/services/loaders.py
import os
import numpy as np

# --- AUDIO (wav) ---
import soundfile as sf

# --- LIGO (hdf5) ---
import h5py

# Optional EEG backends (we'll try them if present)
_HAS_PYEDFLIB = False
_HAS_MNE = False
_HAS_WFDB = False
try:
    import pyedflib   # may not exist on Py3.12 Windows
    _HAS_PYEDFLIB = True
except Exception:
    try:
        import mne    # heavier but works; also optional
        _HAS_MNE = True
    except Exception:
        pass
try:
    import wfdb  # ECG reader for .hea/.dat
    _HAS_WFDB = True
except Exception:
    pass

def _clean_signal(x: np.ndarray) -> np.ndarray:
    """Replace NaNs/Infs with finite values so downstream SciPy calls don't fail."""
    return np.nan_to_num(x, nan=0.0, posinf=0.0, neginf=0.0)


def load_audio_wav(path: str):
    x, fs = sf.read(path, dtype="float32", always_2d=False)
    if x.ndim > 1:
        x = x.mean(axis=1)  # mono fold
    x = _clean_signal(np.asarray(x, dtype=np.float32))
    return x, int(fs), {"type": "audio", "name": os.path.basename(path)}

def _find_hdf5_strain(f: h5py.File):
    # common GWOSC layouts
    candidates = [
        "strain/Strain",
        "H1:GWOSC-4KHZ_R1/strain/Strain",
        "L1:GWOSC-4KHZ_R1/strain/Strain",
        "GWOSC-4KHZ_R1/strain/Strain",
    ]
    for k in candidates:
        if k in f:
            return f[k]
    # fallback: search recursively for something named 'Strain' or containing 'strain'
    def dfs(g):
        for name, obj in g.items():
            if isinstance(obj, h5py.Dataset) and (name == "Strain" or "strain" in name.lower()):
                return obj
            if isinstance(obj, h5py.Group):
                hit = dfs(obj)
                if hit is not None:
                    return hit
        return None
    return dfs(f)

def load_ligo_hdf5(path: str):
    with h5py.File(path, "r") as f:
        d = _find_hdf5_strain(f)
        if d is None:
            raise ValueError("Could not locate strain dataset in HDF5 (no 'strain/Strain').")
        x = _clean_signal(np.asarray(d[:], dtype=np.float32))
        # try sampling metadata; otherwise assume 4096 Hz common release
        fs = 4096
        try:
            # some files store dt or Xspacing
            dt = None
            for key in ("dt", "Xspacing", "dx"):
                if key in d.attrs:
                    dt = float(d.attrs[key])
                    break
            if dt and dt > 0:
                fs = int(round(1.0 / dt))
        except Exception:
            pass
    return x, int(fs), {"type": "ligo", "name": os.path.basename(path)}

def load_eeg_edf(path: str):
    if _HAS_PYEDFLIB:
        f = pyedflib.EdfReader(path)
        try:
            fs = int(f.getSampleFrequency(0))
            x = _clean_signal(f.readSignal(0).astype(np.float32))
            return x, fs, {"type": "eeg", "name": os.path.basename(path)}
        finally:
            f.close()
    if _HAS_MNE:
        raw = mne.io.read_raw_edf(path, preload=True, verbose=False)
        x = _clean_signal(raw.get_data(picks=[0]).squeeze().astype(np.float32))
        fs = int(raw.info["sfreq"])
        return x, fs, {"type": "eeg", "name": os.path.basename(path)}
    # explicit guidance
    raise ImportError("EEG EDF needs 'pyedflib' or 'mne'. On Windows+Py3.12, prefer MNE: pip install mne")

def load_grace_nc(path: str):
    # Grace requires xarray with either h5netcdf or netCDF4 backend
    try:
        import xarray as xr
    except Exception as exc:
        raise ImportError("GRACE NetCDF needs 'xarray' (plus h5netcdf or netCDF4).") from exc

    engines = []
    try:
        import h5netcdf  # noqa: F401
        engines.append("h5netcdf")
    except Exception:
        pass
    try:
        import netCDF4  # noqa: F401
        engines.append("netcdf4")
    except Exception:
        pass
    engines.append(None)  # let xarray auto-detect as a fallback

    last_err = None
    for eng in engines:
        try:
            ds = xr.open_dataset(path, engine=eng) if eng else xr.open_dataset(path)
            try:
                var = next((k for k, da in ds.data_vars.items() if np.issubdtype(da.dtype, np.number)), None)
                if var is None:
                    raise ValueError("No numeric data variables found in .nc file.")
                v = ds[var]
                if "time" in v.dims:
                    arr = np.asarray(v.transpose("time", ...).values)
                    arr = arr.reshape(arr.shape[0], -1).mean(axis=1)
                    fs = 1
                else:
                    arr = np.asarray(v.values).ravel()
                    fs = 1
                arr = _clean_signal(arr)
                return arr.astype(np.float32), int(fs), {"type": "grace", "name": os.path.basename(path)}
            finally:
                ds.close()
        except Exception as err:
            last_err = err
            continue
    raise RuntimeError(f"Failed to parse GRACE NetCDF: {last_err}")

# public dispatcher
def load_by_domain(domain: str, path: str):
    ext = os.path.splitext(path)[1].lower()
    if domain == "audio":
        if ext != ".wav":
            raise ValueError("Audio domain expects .wav")
        return load_audio_wav(path)
    if domain == "ligo":
        if ext not in (".hdf5", ".h5"):
            raise ValueError("LIGO domain expects .hdf5/.h5")
        return load_ligo_hdf5(path)
    if domain == "eeg":
        if ext != ".edf":
            raise ValueError("EEG domain expects .edf")
        return load_eeg_edf(path)
    if domain == "ecg":
        if not _HAS_WFDB:
            raise ImportError("ECG requires 'wfdb' package. Install: pip install wfdb")
        # Accept either .hea or .dat file path; wfdb resolves pair by basename
        base, _ = os.path.splitext(path)
        rec = wfdb.rdsamp(base)
        sig = rec.p_signal if hasattr(rec, "p_signal") else rec.d_signal
        if sig.ndim > 1:
            sig = sig.mean(axis=1)
        fs = float(getattr(rec, "fs", 250.0))
        return sig.astype(np.float32), int(fs), {"type": "ecg", "name": os.path.basename(path)}
    if domain == "grace":
        if ext == ".nc":
            return load_grace_nc(path)
        raise ValueError("GRACE domain expects .nc")
    raise ValueError("domain must be one of: audio|eeg|ligo|grace")
