import math
from typing import Tuple

import numpy as np
from scipy.signal import (
    butter,
    detrend,
    filtfilt,
    hilbert,
    iirnotch,
    resample_poly,
    windows,
)

from ..core.config import settings

#  heyyy this is fastAPI feature service

def _band(sig: np.ndarray, fs: float, lo: float, hi: float, order: int = 4) -> np.ndarray:
    if fs <= 0:
        return sig
    hi = min(hi, fs / 2.0 - 1e-3)
    lo = max(lo, 1e-3)
    if not math.isfinite(lo) or not math.isfinite(hi) or lo >= hi:
        return sig
    b, a = butter(order, [lo / (fs / 2.0), hi / (fs / 2.0)], btype="band")
    return filtfilt(b, a, sig)


def _notch(sig: np.ndarray, fs: float, mains: float = 50.0, q: float = 30.0) -> np.ndarray:
    if fs <= 0:
        return sig
    try:
        for freq in (mains, 60.0):
            b, a = iirnotch(freq / (fs / 2.0), q)
            sig = filtfilt(b, a, sig)
    except ValueError:
        pass
    return sig


def _resample(sig: np.ndarray, fs: float, target: float) -> Tuple[np.ndarray, float]:
    if not target or abs(fs - target) < 1e-9:
        return sig, float(fs)
    up = int(round(target))
    down = int(round(fs))
    g = math.gcd(max(up, 1), max(down, 1))
    sig = resample_poly(sig, max(up // g, 1), max(down // g, 1))
    return sig, float(target)


def first_window(sig: np.ndarray, fs: float, sec: float = 30.0) -> np.ndarray:
    if fs <= 0:
        return sig
    n = min(len(sig), int(sec * fs))
    return sig[: max(n, min(len(sig), int(5 * fs)))]


def dom_freq(sig: np.ndarray, fs: float) -> float:
    if len(sig) < 4 or fs <= 0:
        return 0.0
    s = detrend(sig)
    N = len(s)
    Y = np.abs(np.fft.rfft(s * windows.hann(N)))
    X = np.fft.rfftfreq(N, 1 / fs)
    if len(X) < 3:
        return 0.0
    idx = np.argmax(Y[2:]) + 2
    return float(X[idx])


def spec_centroid_bw(sig: np.ndarray, fs: float) -> Tuple[float, float]:
    if len(sig) < 4 or fs <= 0:
        return 0.0, 0.0
    s = detrend(sig)
    N = len(s)
    S = np.abs(np.fft.rfft(s * windows.hann(N))) + 1e-12
    F = np.fft.rfftfreq(N, 1 / fs)
    cen = np.sum(F * S) / np.sum(S)
    bw = np.sqrt(np.sum(((F - cen) ** 2) * S) / np.sum(S))
    return float(cen), float(bw)


def psi_envelope(sig: np.ndarray) -> np.ndarray:
    env = np.abs(hilbert(sig))
    env /= env.max() + 1e-12
    win = max(3, len(env) // 200)
    if win % 2 == 0:
        win += 1
    kernel = np.ones(win) / win
    return np.convolve(env, kernel, mode="same")


def gamma_proxy(env: np.ndarray, fs: float) -> float:
    if len(env) == 0 or fs <= 0:
        return 0.0
    pk = int(np.argmax(env))
    if pk <= 1 or pk >= len(env) - 2:
        return 0.1
    half = env[pk] / 2.0
    left = np.where(env[:pk] <= half)[0]
    right = np.where(env[pk:] <= half)[0]
    if left.size == 0 or right.size == 0:
        return 0.1
    width = (pk - left[-1] + right[0]) / fs
    return float(1.0 / (width + 1e-3))


def collapse_proxy_time(env: np.ndarray, fs: float, pk_pad_sec: float = 0.05, thr: float = 0.12, min_hold_sec: float = 0.15) -> float:
    if fs <= 0 or len(env) == 0:
        return 0.0
    n = len(env)
    pk = int(np.argmax(env))
    start = min(n - 1, pk + int(pk_pad_sec * fs))
    tail = env[start:]
    if len(tail) == 0:
        return pk / fs
    hold = max(1, int(min_hold_sec * fs))
    below = np.where(tail <= thr)[0]
    for j in below:
        hi = min(len(tail), j + hold)
        if np.all(tail[j:hi] <= thr):
            return (start + j) / fs
    t = np.arange(len(tail)) / fs
    y = np.clip(tail, 1e-6, 1.0)
    if len(t) == 0:
        return pk / fs
    X = np.vstack([np.ones_like(t), -t]).T
    a, b = np.linalg.lstsq(X, np.log(y), rcond=None)[0]
    if b <= 1e-6:
        return (start + int(0.5 * len(tail))) / fs
    t_hit = (a - np.log(thr)) / b
    t_hit = np.clip(t_hit, 0, t[-1])
    return (start + int(t_hit * fs)) / fs


def energy_drop_ratio(env: np.ndarray, fs: float, ct: float, tail_frac: float = 0.2) -> float:
    if len(env) == 0 or fs <= 0:
        return 0.0
    n = len(env)
    split = int(np.clip(ct * fs, 1, n - 2))
    before = np.mean(env[:split]) if split > 0 else np.mean(env)
    before = max(before, 1e-6)
    tail_start = int(n * (1 - tail_frac))
    after = np.mean(env[tail_start:]) if tail_start < n else env[-1]
    after = max(after, 1e-6)
    return float(after / before)


def _to_vec(feat: dict, fs: float) -> np.ndarray:
    nyq = max(fs / 2.0, 1e-6)
    vec = np.array(
        [
            np.clip(float(feat.get("gamma", 0.0)) / 5.0, 0.0, 3.0),
            np.clip(float(feat.get("energy", 0.0)), 0.0, 1.0),
            np.clip(float(feat.get("noise", 0.0)), 0.0, 1.0),
            np.clip(float(feat.get("cen", 0.0)) / (nyq + 1e-6), 0.0, 1.0),
            np.clip(float(feat.get("lam", 0.0)), 0.0, 2.0),
        ],
        dtype=float,
    )
    return np.nan_to_num(vec, nan=0.0, posinf=0.0, neginf=0.0)


def prepare_signal(domain: str, sig: np.ndarray, fs: float) -> Tuple[np.ndarray, float]:
    sig = np.asarray(sig, dtype=float)
    # ensure we never pass NaNs/Infs into SciPy transforms
    sig = np.nan_to_num(sig, nan=0.0, posinf=0.0, neginf=0.0)
    if domain == "audio":
        sig = _band(sig, fs, 20.0, min(8000.0, fs / 2.0 - 1.0))
        sig, fs = _resample(sig, fs, float(settings.RESAMPLE_AUDIO_HZ))
    elif domain == "eeg":
        sig = _band(sig, fs, 1.0, 45.0)
        sig = _notch(sig, fs)
        sig, fs = _resample(sig, fs, float(settings.RESAMPLE_EEG_HZ))
    elif domain == "ligo":
        sig = detrend(sig)
        if not fs:
            fs = settings.DEFAULT_LIGO_FS
    elif domain == "grace":
        if not fs:
            fs = settings.DEFAULT_GRACE_FS
    else:
        if not fs:
            fs = float(len(sig))
    sig = np.nan_to_num(sig, nan=0.0, posinf=0.0, neginf=0.0)
    return sig.astype(np.float32), float(fs)


def compute_features(domain: str, sig: np.ndarray, fs: float) -> Tuple[np.ndarray, np.ndarray, dict, np.ndarray]:
    sig, fs = prepare_signal(domain, sig, fs)
    window = first_window(sig, fs)
    window = np.nan_to_num(window, nan=0.0, posinf=0.0, neginf=0.0)
    env = psi_envelope(window)
    env = np.nan_to_num(env, nan=0.0, posinf=0.0, neginf=0.0)
    dom = dom_freq(window, fs)
    cen, bw = spec_centroid_bw(window, fs)
    energy = float(np.clip(np.mean(env), 0.0, 1.0))
    noise = float(np.clip(np.std(window - env * np.sign(window)), 0.0, 1.0))
    gamma = float(gamma_proxy(env, fs))
    beta = float(np.mean(np.abs(np.gradient(env))))
    lam = float(np.clip(bw / (max(fs / 2.0, 1e-6)), 0.0, 2.0))

    # Clean any accidental NaNs/Infs from scalar features
    def _clean_scalar(x: float) -> float:
        return float(np.nan_to_num(x, nan=0.0, posinf=0.0, neginf=0.0))

    feat = dict(
        dom=_clean_scalar(dom),
        cen=_clean_scalar(cen),
        bw=_clean_scalar(bw),
        energy=_clean_scalar(energy),
        noise=_clean_scalar(noise),
        gamma=_clean_scalar(gamma),
        beta=_clean_scalar(beta),
        lam=_clean_scalar(lam),
    )
    vec = _to_vec(feat, fs)
    return window, env, feat, vec


__all__ = [
    "prepare_signal",
    "compute_features",
    "collapse_proxy_time",
    "energy_drop_ratio",
    "first_window",
]
