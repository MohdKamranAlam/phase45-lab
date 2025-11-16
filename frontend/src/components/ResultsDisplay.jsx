import { useState } from 'react';
import './ResultsDisplay.css';

function ResultsDisplay({ result }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!result || !result.success) {
    return null;
  }

  const { filename, file_type, features, prediction, visualizations } = result;

  const getRiskBadgeClass = (level) => {
    switch (level) {
      case 'High':
        return 'badge-danger';
      case 'Medium':
        return 'badge-warning';
      case 'Low':
        return 'badge-success';
      default:
        return 'badge-success';
    }
  };

  const exportResults = () => {
    const exportData = {
      filename,
      file_type,
      timestamp: new Date().toISOString(),
      features,
      prediction,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analysis_${filename}_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="results-container">
      <div className="results-header">
        <div>
          <h2 className="section-title">Analysis Results</h2>
          <p className="results-meta">
            File: <strong>{filename}</strong> · Type: <strong>{file_type}</strong>
          </p>
        </div>
        <button className="btn btn-secondary" onClick={exportResults}>
          💾 Export Results
        </button>
      </div>

      {/* Prediction Card */}
      <div className="prediction-card">
        <h3>ψ-Collapse Prediction</h3>
        <div className="prediction-content">
          <div className="collapse-score">
            <div className="score-circle">
              <svg viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="var(--border)"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="var(--primary-color)"
                  strokeWidth="8"
                  strokeDasharray={`${prediction.collapse_score * 2.827} 282.7`}
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="score-value">{prediction.collapse_score.toFixed(1)}</div>
            </div>
            <p className="score-label">Collapse Score</p>
          </div>
          <div className="prediction-details">
            <div className="detail-item">
              <span className="detail-label">Risk Level:</span>
              <span className={`badge ${getRiskBadgeClass(prediction.risk_level)}`}>
                {prediction.risk_level}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Confidence:</span>
              <span className="detail-value">{(prediction.confidence * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs for different views */}
      <div className="results-tabs">
        <div className="tab-buttons">
          <button
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button
            className={`tab-button ${activeTab === 'visualizations' ? 'active' : ''}`}
            onClick={() => setActiveTab('visualizations')}
          >
            📈 Visualizations
          </button>
          <button
            className={`tab-button ${activeTab === 'raw' ? 'active' : ''}`}
            onClick={() => setActiveTab('raw')}
          >
            🔧 Raw Data
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="overview-grid">
              <div className="feature-card">
                <h4>Coherence Time (ct)</h4>
                <div className="feature-value">{features.ct.toFixed(6)} s</div>
                <p className="feature-desc">Characteristic time scale of the signal</p>
              </div>

              <div className="feature-card">
                <h4>Collapse Rate (γ)</h4>
                <div className="feature-value">{features.gamma.toFixed(4)} Hz</div>
                <p className="feature-desc">Rate parameter for ψ-collapse</p>
              </div>

              <div className="feature-card">
                <h4>Noise Level</h4>
                <div className="feature-value">{features.noise.toExponential(2)}</div>
                <p className="feature-desc">High-frequency noise estimation</p>
              </div>

              <div className="feature-card">
                <h4>Signal Energy</h4>
                <div className="feature-value">{features.energy.toFixed(2)}</div>
                <p className="feature-desc">Total signal energy</p>
              </div>

              <div className="feature-card">
                <h4>Spectral Entropy</h4>
                <div className="feature-value">{features.entropy.toFixed(4)}</div>
                <p className="feature-desc">Frequency complexity measure</p>
              </div>

              <div className="feature-card">
                <h4>Peak Frequency</h4>
                <div className="feature-value">{features.peak_freq.toFixed(2)} Hz</div>
                <p className="feature-desc">Dominant frequency component</p>
              </div>

              <div className="feature-card">
                <h4>SNR</h4>
                <div className="feature-value">{features.snr.toFixed(2)} dB</div>
                <p className="feature-desc">Signal-to-Noise Ratio</p>
              </div>

              <div className="feature-card">
                <h4>Duration</h4>
                <div className="feature-value">{features.duration.toFixed(3)} s</div>
                <p className="feature-desc">Total recording duration</p>
              </div>
            </div>
          )}

          {activeTab === 'visualizations' && (
            <div className="visualizations-grid">
              <div className="viz-card">
                <h4>Signal Waveform</h4>
                <img src={visualizations.waveform} alt="Waveform" className="viz-image" />
              </div>

              <div className="viz-card">
                <h4>Frequency Spectrum</h4>
                <img src={visualizations.spectrum} alt="Spectrum" className="viz-image" />
              </div>

              <div className="viz-card full-width">
                <h4>Spectrogram</h4>
                <img src={visualizations.spectrogram} alt="Spectrogram" className="viz-image" />
              </div>
            </div>
          )}

          {activeTab === 'raw' && (
            <div className="raw-data">
              <pre>{JSON.stringify({ features, prediction }, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResultsDisplay;
