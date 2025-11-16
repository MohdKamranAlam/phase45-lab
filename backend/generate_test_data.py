"""
Test Data Generator for Signal Forge Phase-45R4 Lab

This script generates sample WAV files for testing the application.
"""

import numpy as np
import wave
import struct

def generate_sine_wave(frequency=440, duration=2, sample_rate=44100, amplitude=0.5):
    """Generate a simple sine wave."""
    t = np.linspace(0, duration, int(sample_rate * duration))
    signal = amplitude * np.sin(2 * np.pi * frequency * t)
    return signal, sample_rate

def generate_noisy_signal(duration=2, sample_rate=44100, noise_level=0.1):
    """Generate a noisy signal."""
    t = np.linspace(0, duration, int(sample_rate * duration))
    # Mix of multiple frequencies
    signal = 0.3 * np.sin(2 * np.pi * 440 * t)  # A4
    signal += 0.2 * np.sin(2 * np.pi * 554.37 * t)  # C#5
    signal += 0.15 * np.sin(2 * np.pi * 659.25 * t)  # E5
    # Add noise
    signal += noise_level * np.random.randn(len(t))
    return signal, sample_rate

def generate_chirp(f0=100, f1=2000, duration=2, sample_rate=44100):
    """Generate a chirp signal (frequency sweep)."""
    t = np.linspace(0, duration, int(sample_rate * duration))
    # Linear frequency sweep
    phase = 2 * np.pi * (f0 * t + (f1 - f0) * t**2 / (2 * duration))
    signal = 0.5 * np.sin(phase)
    return signal, sample_rate

def save_wav_file(filename, signal, sample_rate):
    """Save signal as WAV file."""
    # Normalize to 16-bit range
    signal = np.int16(signal / np.max(np.abs(signal)) * 32767)
    
    with wave.open(filename, 'w') as wav_file:
        # Set parameters
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 16-bit
        wav_file.setframerate(sample_rate)
        
        # Write data
        wav_file.writeframes(signal.tobytes())
    
    print(f"Created: {filename}")

if __name__ == "__main__":
    import os
    
    # Create test_data directory
    os.makedirs("test_data", exist_ok=True)
    
    # Generate test files
    print("Generating test WAV files...")
    
    # 1. Simple sine wave
    signal, sr = generate_sine_wave(frequency=440, duration=2)
    save_wav_file("test_data/sine_440hz.wav", signal, sr)
    
    # 2. Noisy signal
    signal, sr = generate_noisy_signal(duration=3, noise_level=0.05)
    save_wav_file("test_data/noisy_signal.wav", signal, sr)
    
    # 3. Chirp signal
    signal, sr = generate_chirp(f0=100, f1=2000, duration=2)
    save_wav_file("test_data/chirp_100_2000hz.wav", signal, sr)
    
    # 4. Low frequency signal (simulating EEG-like)
    signal, sr = generate_sine_wave(frequency=10, duration=5, sample_rate=256)
    save_wav_file("test_data/low_freq_10hz.wav", signal, sr)
    
    print("\nTest files created in 'test_data/' directory")
    print("You can upload these files to test the application.")
