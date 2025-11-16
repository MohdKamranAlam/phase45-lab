import { useState } from 'react';
import './App.css';
import FileUpload from './components/FileUpload';
import ResultsDisplay from './components/ResultsDisplay';
import KPIDashboard from './components/KPIDashboard';

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalysisComplete = (result) => {
    setAnalysisResult(result);
    setIsLoading(false);
  };

  const handleAnalysisStart = () => {
    setIsLoading(true);
    setAnalysisResult(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>⚡ Signal Forge · Phase-45R4 Lab</h1>
        <p className="subtitle">
          ψ-Collapse Feature Extraction · AUDIO | EEG | LIGO | GRACE
        </p>
      </header>

      <main className="app-main">
        <div className="upload-section">
          <FileUpload 
            onAnalysisComplete={handleAnalysisComplete}
            onAnalysisStart={handleAnalysisStart}
          />
        </div>

        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Analyzing signal data...</p>
          </div>
        )}

        {analysisResult && (
          <>
            <ResultsDisplay result={analysisResult} />
            <KPIDashboard features={analysisResult.features} />
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>Signal Forge Phase-45R4 Lab · Quantum Collapse Analysis System</p>
      </footer>
    </div>
  );
}

export default App;
