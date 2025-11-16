import './KPIDashboard.css';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

function KPIDashboard({ features }) {
  if (!features) return null;

  // Prepare data for charts
  const featureComparison = [
    { name: 'ct', value: features.ct * 1000, unit: 'ms' },
    { name: 'γ', value: features.gamma, unit: 'Hz' },
    { name: 'Energy', value: Math.log10(features.energy + 1), unit: 'log' },
    { name: 'Entropy', value: features.entropy, unit: '' },
    { name: 'SNR', value: features.snr, unit: 'dB' },
  ];

  const signalMetrics = [
    { metric: 'Sample Rate', value: features.sample_rate, unit: 'Hz' },
    { metric: 'Duration', value: features.duration, unit: 's' },
    { metric: 'Samples', value: features.num_samples, unit: '' },
    { metric: 'Variance', value: features.variance, unit: '' },
  ];

  const waterRiskData = [
    { category: 'Coherence', risk: (1 / (features.ct + 0.1)) * 10, threshold: 50 },
    { category: 'Noise', risk: features.noise * 1000, threshold: 50 },
    { category: 'Instability', risk: features.variance * 20, threshold: 50 },
    { category: 'Complexity', risk: features.entropy * 10, threshold: 50 },
  ];

  return (
    <div className="kpi-dashboard">
      <h2 className="section-title">KPI Dashboard</h2>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        {signalMetrics.map((metric) => (
          <div key={metric.metric} className="metric-card">
            <div className="metric-label">{metric.metric}</div>
            <div className="metric-value">
              {typeof metric.value === 'number' 
                ? metric.value.toLocaleString(undefined, {
                    maximumFractionDigits: metric.unit === '' && metric.value > 100 ? 0 : 4
                  })
                : metric.value}
              {metric.unit && <span className="metric-unit"> {metric.unit}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Feature Comparison Chart */}
      <div className="chart-container">
        <h3>ψ-Collapse Feature Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={featureComparison}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" stroke="var(--text-secondary)" />
            <YAxis stroke="var(--text-secondary)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text-primary)'
              }}
            />
            <Bar dataKey="value" fill="var(--primary-color)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Water Risk Assessment */}
      <div className="chart-container">
        <h3>🌊 Water Risk Assessment Dashboard</h3>
        <p className="chart-subtitle">
          Analyzing signal instability factors that may correlate with water-related quantum collapse events
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={waterRiskData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="category" stroke="var(--text-secondary)" />
            <YAxis stroke="var(--text-secondary)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text-primary)'
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="risk"
              stroke="var(--danger)"
              fill="var(--danger)"
              fillOpacity={0.6}
              name="Risk Level"
            />
            <Area
              type="monotone"
              dataKey="threshold"
              stroke="var(--warning)"
              fill="var(--warning)"
              fillOpacity={0.2}
              name="Threshold"
            />
          </AreaChart>
        </ResponsiveContainer>
        
        <div className="risk-indicators">
          <div className="risk-indicator">
            <span className="indicator-icon">💧</span>
            <div className="indicator-content">
              <div className="indicator-label">Coherence Decay</div>
              <div className="indicator-desc">
                Rapid coherence time decay may indicate water molecule interaction effects
              </div>
            </div>
          </div>
          <div className="risk-indicator">
            <span className="indicator-icon">🌀</span>
            <div className="indicator-content">
              <div className="indicator-label">Signal Turbulence</div>
              <div className="indicator-desc">
                High noise levels correlate with environmental water turbulence
              </div>
            </div>
          </div>
          <div className="risk-indicator">
            <span className="indicator-icon">⚡</span>
            <div className="indicator-content">
              <div className="indicator-label">Quantum Instability</div>
              <div className="indicator-desc">
                Variance spikes suggest quantum decoherence in aqueous environments
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KPIDashboard;
