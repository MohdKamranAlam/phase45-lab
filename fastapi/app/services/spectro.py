import numpy as np
from scipy.signal import spectrogram

def spectro_db(sig: np.ndarray, fs: float):
    f, t, Sxx = spectrogram(sig, fs=fs, nperseg=max(64,int(fs//4)), noverlap=None)
    Sxx = 10*np.log10(Sxx + 1e-12)
    return t.astype(float).tolist(), f.astype(float).tolist(), Sxx.astype(float).tolist()
