import { useState, useRef } from 'react';
import axios from 'axios';
import './FileUpload.css';

const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:3001';

function FileUpload({ onAnalysisComplete, onAnalysisStart }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file) => {
    const validExtensions = ['.wav', '.edf', '.h5', '.hdf5', '.nc'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      setError('Invalid file type. Supported: WAV, EDF, HDF5, NC');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setError(null);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    
    const file = event.dataTransfer.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    onAnalysisStart();
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post(`${GATEWAY_URL}/api/analyze`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // 2 minute timeout
      });

      onAnalysisComplete(response.data);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || err.message || 'Analysis failed');
      onAnalysisComplete(null);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="file-upload-container">
      <div 
        className={`drop-zone ${isDragging ? 'dragging' : ''} ${selectedFile ? 'has-file' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".wav,.edf,.h5,.hdf5,.nc"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        
        <div className="drop-zone-content">
          {selectedFile ? (
            <>
              <div className="file-icon">📁</div>
              <p className="file-name">{selectedFile.name}</p>
              <p className="file-size">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </>
          ) : (
            <>
              <div className="upload-icon">⬆️</div>
              <p className="drop-text">
                Drop your file here or click to browse
              </p>
              <p className="supported-formats">
                Supported: WAV · EDF · HDF5 · NetCDF
              </p>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      <div className="upload-actions">
        {selectedFile && (
          <>
            <button 
              className="btn btn-primary"
              onClick={handleUpload}
            >
              🔬 Analyze Signal
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => {
                setSelectedFile(null);
                setError(null);
              }}
            >
              ✖️ Clear
            </button>
          </>
        )}
      </div>

      <div className="upload-info">
        <h3>Supported File Types:</h3>
        <ul>
          <li><strong>WAV</strong> - Audio signals</li>
          <li><strong>EDF</strong> - EEG/Medical signals</li>
          <li><strong>HDF5</strong> - LIGO gravitational wave data</li>
          <li><strong>NetCDF</strong> - GRACE satellite data</li>
        </ul>
      </div>
    </div>
  );
}

export default FileUpload;
