from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import numpy as np
from scipy import signal
from scipy.fft import fft, fftfreq
import io
import wave
import h5py
import pyedflib
from netCDF4 import Dataset
from typing import Dict, List, Any
import json
import base64
from matplotlib import pyplot as plt
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend

app = FastAPI(title="Signal Forge Phase-45R4 Lab API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def extract_psi_collapse_features(data: np.ndarray, sample_rate: float) -> Dict[str, Any]:
    """
    Extract ψ-collapse features from signal data.
    
    Features:
    - ct: Coherence time (characteristic time scale)
    - γ (gamma): Collapse rate parameter
    - noise: Noise level estimation
    - energy: Signal energy
    - entropy: Spectral entropy
    - peak_freq: Dominant frequency
    """
    # Ensure 1D signal
    if len(data.shape) > 1:
        data = data.flatten()
    
    # Normalize signal
    data_norm = (data - np.mean(data)) / (np.std(data) + 1e-10)
    
    # Calculate FFT for frequency domain analysis
    N = len(data_norm)
    yf = fft(data_norm)
    xf = fftfreq(N, 1 / sample_rate)
    
    # Only positive frequencies
    pos_mask = xf > 0
    xf_pos = xf[pos_mask]
    yf_pos = np.abs(yf[pos_mask])
    
    # Power spectral density
    psd = yf_pos ** 2
    psd_norm = psd / np.sum(psd)
    
    # Spectral entropy
    psd_norm_safe = psd_norm[psd_norm > 0]
    spectral_entropy = -np.sum(psd_norm_safe * np.log2(psd_norm_safe))
    
    # Peak frequency
    peak_idx = np.argmax(psd)
    peak_freq = float(xf_pos[peak_idx]) if len(xf_pos) > 0 else 0.0
    
    # Energy
    energy = float(np.sum(data_norm ** 2))
    
    # Autocorrelation for coherence time
    autocorr = np.correlate(data_norm, data_norm, mode='full')
    autocorr = autocorr[len(autocorr)//2:]
    autocorr = autocorr / autocorr[0]
    
    # Find first zero-crossing or decay to 1/e
    threshold = 1 / np.e
    coherence_indices = np.where(autocorr < threshold)[0]
    if len(coherence_indices) > 0:
        coherence_time_samples = coherence_indices[0]
        ct = float(coherence_time_samples / sample_rate)
    else:
        ct = float(len(autocorr) / sample_rate)
    
    # Gamma (collapse rate) - inverse of coherence time
    gamma = 1.0 / ct if ct > 0 else 0.0
    
    # Noise estimation (high-frequency content)
    high_freq_mask = xf_pos > (sample_rate / 4)
    if np.sum(high_freq_mask) > 0:
        noise_level = float(np.mean(psd[high_freq_mask]))
    else:
        noise_level = 0.0
    
    # Calculate variance and standard deviation
    variance = float(np.var(data_norm))
    std_dev = float(np.std(data_norm))
    
    # Signal-to-noise ratio estimate
    signal_power = float(np.mean(psd[:len(psd)//2]))  # Low-mid frequencies
    noise_power = noise_level if noise_level > 0 else 1e-10
    snr = 10 * np.log10(signal_power / noise_power)
    
    return {
        "ct": ct,
        "gamma": gamma,
        "noise": noise_level,
        "energy": energy,
        "entropy": spectral_entropy,
        "peak_freq": peak_freq,
        "variance": variance,
        "std_dev": std_dev,
        "snr": snr,
        "sample_rate": sample_rate,
        "duration": len(data) / sample_rate,
        "num_samples": len(data)
    }


def generate_spectrogram(data: np.ndarray, sample_rate: float) -> str:
    """Generate spectrogram and return as base64 encoded image."""
    if len(data.shape) > 1:
        data = data.flatten()
    
    fig, ax = plt.subplots(figsize=(10, 6))
    
    # Compute spectrogram
    f, t, Sxx = signal.spectrogram(data, sample_rate, nperseg=min(256, len(data)//4))
    
    # Plot
    im = ax.pcolormesh(t, f, 10 * np.log10(Sxx + 1e-10), shading='gouraud', cmap='viridis')
    ax.set_ylabel('Frequency [Hz]')
    ax.set_xlabel('Time [sec]')
    ax.set_title('Spectrogram')
    plt.colorbar(im, ax=ax, label='Power [dB]')
    
    # Save to buffer
    buf = io.BytesIO()
    plt.savefig(buf, format='png', dpi=100, bbox_inches='tight')
    plt.close(fig)
    buf.seek(0)
    
    # Encode to base64
    img_base64 = base64.b64encode(buf.read()).decode('utf-8')
    return f"data:image/png;base64,{img_base64}"


def generate_waveform(data: np.ndarray, sample_rate: float) -> str:
    """Generate waveform plot and return as base64 encoded image."""
    if len(data.shape) > 1:
        data = data.flatten()
    
    # Limit to first 10000 samples for visualization
    max_samples = min(10000, len(data))
    data_plot = data[:max_samples]
    time = np.arange(max_samples) / sample_rate
    
    fig, ax = plt.subplots(figsize=(12, 4))
    ax.plot(time, data_plot, linewidth=0.5)
    ax.set_xlabel('Time [s]')
    ax.set_ylabel('Amplitude')
    ax.set_title('Signal Waveform')
    ax.grid(True, alpha=0.3)
    
    # Save to buffer
    buf = io.BytesIO()
    plt.savefig(buf, format='png', dpi=100, bbox_inches='tight')
    plt.close(fig)
    buf.seek(0)
    
    # Encode to base64
    img_base64 = base64.b64encode(buf.read()).decode('utf-8')
    return f"data:image/png;base64,{img_base64}"


def generate_frequency_spectrum(data: np.ndarray, sample_rate: float) -> str:
    """Generate frequency spectrum plot and return as base64 encoded image."""
    if len(data.shape) > 1:
        data = data.flatten()
    
    # Calculate FFT
    N = len(data)
    yf = fft(data)
    xf = fftfreq(N, 1 / sample_rate)
    
    # Only positive frequencies
    pos_mask = xf > 0
    xf_pos = xf[pos_mask]
    yf_pos = np.abs(yf[pos_mask])
    
    fig, ax = plt.subplots(figsize=(12, 4))
    ax.plot(xf_pos, yf_pos, linewidth=0.5)
    ax.set_xlabel('Frequency [Hz]')
    ax.set_ylabel('Magnitude')
    ax.set_title('Frequency Spectrum')
    ax.set_xlim(0, sample_rate / 2)
    ax.grid(True, alpha=0.3)
    
    # Save to buffer
    buf = io.BytesIO()
    plt.savefig(buf, format='png', dpi=100, bbox_inches='tight')
    plt.close(fig)
    buf.seek(0)
    
    # Encode to base64
    img_base64 = base64.b64encode(buf.read()).decode('utf-8')
    return f"data:image/png;base64,{img_base64}"


async def process_wav_file(contents: bytes) -> tuple[np.ndarray, float]:
    """Process WAV audio file."""
    with wave.open(io.BytesIO(contents), 'rb') as wav_file:
        sample_rate = wav_file.getframerate()
        n_frames = wav_file.getnframes()
        audio_data = wav_file.readframes(n_frames)
        
        # Convert to numpy array
        if wav_file.getsampwidth() == 2:
            data = np.frombuffer(audio_data, dtype=np.int16)
        elif wav_file.getsampwidth() == 1:
            data = np.frombuffer(audio_data, dtype=np.uint8)
        else:
            data = np.frombuffer(audio_data, dtype=np.int32)
        
        # Convert to float
        data = data.astype(np.float64)
        
        return data, float(sample_rate)


async def process_edf_file(contents: bytes) -> tuple[np.ndarray, float]:
    """Process EDF (EEG) file."""
    # Save to temporary buffer
    temp_path = "/tmp/temp_edf_file.edf"
    with open(temp_path, 'wb') as f:
        f.write(contents)
    
    try:
        # Read EDF file
        edf_file = pyedflib.EdfReader(temp_path)
        n_signals = edf_file.signals_in_file
        
        if n_signals == 0:
            raise ValueError("No signals found in EDF file")
        
        # Read first signal
        signal_data = edf_file.readSignal(0)
        sample_rate = edf_file.getSampleFrequency(0)
        
        edf_file.close()
        
        return signal_data, float(sample_rate)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing EDF file: {str(e)}")


async def process_hdf5_file(contents: bytes) -> tuple[np.ndarray, float]:
    """Process HDF5 file (LIGO/GRACE data)."""
    # Save to temporary buffer
    temp_path = "/tmp/temp_hdf5_file.h5"
    with open(temp_path, 'wb') as f:
        f.write(contents)
    
    try:
        with h5py.File(temp_path, 'r') as f:
            # Try to find strain data (common in LIGO files)
            data = None
            sample_rate = 4096.0  # Default LIGO sample rate
            
            # Common LIGO paths
            if 'strain/Strain' in f:
                data = f['strain/Strain'][:]
            elif 'strain' in f:
                data = f['strain'][:]
            else:
                # Get first dataset
                def find_first_dataset(name, obj):
                    if isinstance(obj, h5py.Dataset) and len(obj.shape) == 1:
                        return obj[:]
                    return None
                
                # Traverse HDF5 file
                for key in f.keys():
                    if isinstance(f[key], h5py.Dataset):
                        data = f[key][:]
                        break
            
            if data is None:
                raise ValueError("No suitable dataset found in HDF5 file")
            
            # Try to get sample rate from metadata
            if 'sample_rate' in f.attrs:
                sample_rate = float(f.attrs['sample_rate'])
            
            return data, sample_rate
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing HDF5 file: {str(e)}")


async def process_netcdf_file(contents: bytes) -> tuple[np.ndarray, float]:
    """Process NetCDF file (GRACE data)."""
    # Save to temporary buffer
    temp_path = "/tmp/temp_nc_file.nc"
    with open(temp_path, 'wb') as f:
        f.write(contents)
    
    try:
        with Dataset(temp_path, 'r') as nc:
            # Get first variable with data
            data = None
            sample_rate = 1.0  # Default sample rate
            
            for var_name in nc.variables.keys():
                var = nc.variables[var_name]
                if len(var.shape) == 1 and var.shape[0] > 1:
                    data = var[:]
                    break
            
            if data is None:
                raise ValueError("No suitable variable found in NetCDF file")
            
            # Convert masked array to regular array
            if hasattr(data, 'filled'):
                data = data.filled(np.nan)
            
            # Remove NaN values
            data = data[~np.isnan(data)]
            
            return data, sample_rate
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing NetCDF file: {str(e)}")


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "service": "Signal Forge Phase-45R4 Lab API",
        "version": "1.0.0",
        "status": "operational"
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.post("/analyze")
async def analyze_file(file: UploadFile = File(...)):
    """
    Analyze uploaded file and extract ψ-collapse features.
    
    Supported file types:
    - WAV (audio)
    - EDF (EEG)
    - HDF5 (LIGO)
    - NC (NetCDF/GRACE)
    """
    try:
        # Read file contents
        contents = await file.read()
        filename = file.filename.lower()
        
        # Determine file type and process accordingly
        if filename.endswith('.wav'):
            data, sample_rate = await process_wav_file(contents)
            file_type = "WAV (Audio)"
        elif filename.endswith('.edf'):
            data, sample_rate = await process_edf_file(contents)
            file_type = "EDF (EEG)"
        elif filename.endswith('.h5') or filename.endswith('.hdf5'):
            data, sample_rate = await process_hdf5_file(contents)
            file_type = "HDF5 (LIGO)"
        elif filename.endswith('.nc'):
            data, sample_rate = await process_netcdf_file(contents)
            file_type = "NetCDF (GRACE)"
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type. Supported: WAV, EDF, HDF5, NC"
            )
        
        # Extract features
        features = extract_psi_collapse_features(data, sample_rate)
        
        # Generate visualizations
        spectrogram = generate_spectrogram(data, sample_rate)
        waveform = generate_waveform(data, sample_rate)
        spectrum = generate_frequency_spectrum(data, sample_rate)
        
        # Collapse prediction based on features
        # Simple heuristic: higher gamma and lower noise = higher collapse probability
        collapse_score = min(100, max(0, (features['gamma'] * 10 - features['noise'] * 100 + features['snr']) * 5))
        
        risk_level = "Low"
        if collapse_score > 70:
            risk_level = "High"
        elif collapse_score > 40:
            risk_level = "Medium"
        
        return JSONResponse({
            "success": True,
            "filename": file.filename,
            "file_type": file_type,
            "features": features,
            "prediction": {
                "collapse_score": float(collapse_score),
                "risk_level": risk_level,
                "confidence": 0.85
            },
            "visualizations": {
                "spectrogram": spectrogram,
                "waveform": waveform,
                "spectrum": spectrum
            }
        })
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")


@app.get("/kpis")
async def get_kpis():
    """Get system KPIs."""
    return {
        "total_analyses": 0,
        "avg_processing_time": 0.0,
        "supported_formats": ["WAV", "EDF", "HDF5", "NC"],
        "uptime": "operational"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
