# Signal Forge · Phase-45R4 Lab

⚡ Full-stack application for uploading **AUDIO / EEG / LIGO / GRACE** data files, computing **ψ-collapse features** (coherence time, collapse rate, noise metrics, etc.), and exploring results with interactive charts, spectrograms, and a water-risk dashboard.

## 🚀 Features

- **Multi-format Support**: Process WAV, EDF, HDF5, and NetCDF files
- **ψ-Collapse Analysis**: Extract quantum collapse features including:
  - `ct` (Coherence Time)
  - `γ` (Gamma - Collapse Rate)
  - Noise level estimation
  - Signal energy and spectral entropy
  - Peak frequency and SNR
- **Interactive Visualizations**:
  - Signal waveforms
  - Frequency spectrums
  - Spectrograms
  - Feature comparison charts
- **Water Risk Dashboard**: Specialized analysis for water-related quantum collapse events
- **Export Functionality**: Download analysis results as JSON

## 🏗️ Architecture

The application consists of three main components:

### 1. Backend (FastAPI)
- Python-based API for signal processing
- Handles file upload and feature extraction
- Generates visualizations
- Located in `/backend`

### 2. Gateway (Node.js/Express)
- API gateway and proxy layer
- Handles file upload from frontend
- Routes requests to FastAPI backend
- Located in `/gateway`

### 3. Frontend (React/Vite)
- Modern React UI with Vite
- File upload with drag-and-drop
- Interactive charts using Recharts
- Responsive design
- Located in `/frontend`

## 📋 Prerequisites

- **Python 3.8+** with pip
- **Node.js 16+** with npm
- **Git**

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/MohdKamranAlam/phase45-lab.git
cd phase45-lab
```

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

### 3. Gateway Setup

```bash
cd ../gateway
npm install
```

### 4. Frontend Setup

```bash
cd ../frontend
npm install
```

## 🚀 Running the Application

You need to run all three services. Open three terminal windows:

### Terminal 1: Backend (FastAPI)

```bash
cd backend
python main.py
```

The backend will start on `http://localhost:8000`

### Terminal 2: Gateway (Express)

```bash
cd gateway
npm start
```

The gateway will start on `http://localhost:3001`

### Terminal 3: Frontend (React/Vite)

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

Open your browser and navigate to `http://localhost:5173`

## 📁 Supported File Types

| Format | Extension | Use Case |
|--------|-----------|----------|
| **WAV** | `.wav` | Audio signals |
| **EDF** | `.edf` | EEG/Medical signals |
| **HDF5** | `.h5`, `.hdf5` | LIGO gravitational wave data |
| **NetCDF** | `.nc` | GRACE satellite data |

## 🔬 API Endpoints

### Backend (FastAPI) - Port 8000

- `GET /` - Service information
- `GET /health` - Health check
- `POST /analyze` - Analyze uploaded file
- `GET /kpis` - Get system KPIs

### Gateway (Express) - Port 3001

- `GET /api/health` - Gateway health check
- `GET /api/backend/health` - Backend health check via proxy
- `POST /api/analyze` - Upload and analyze file
- `GET /api/kpis` - Get KPIs via proxy

## 📊 Features Extracted

The system extracts the following ψ-collapse features:

- **ct (Coherence Time)**: Characteristic time scale of signal coherence
- **γ (Gamma)**: Collapse rate parameter (inverse of coherence time)
- **Noise**: High-frequency noise level estimation
- **Energy**: Total signal energy
- **Entropy**: Spectral entropy (frequency complexity)
- **Peak Frequency**: Dominant frequency component
- **Variance**: Signal variance
- **SNR**: Signal-to-Noise Ratio

## 🌊 Water Risk Dashboard

The application includes a specialized dashboard for analyzing water-related quantum collapse events, featuring:

- Coherence decay analysis
- Signal turbulence metrics
- Quantum instability indicators
- Risk threshold visualization

## 🔧 Development

### Frontend Development

```bash
cd frontend
npm run dev     # Development server with hot reload
npm run build   # Production build
npm run preview # Preview production build
```

### Backend Development

```bash
cd backend
# For auto-reload during development:
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Gateway Development

```bash
cd gateway
npm run dev  # Uses nodemon for auto-reload
```

## 🐛 Troubleshooting

### Backend Issues

- Ensure all Python dependencies are installed: `pip install -r requirements.txt`
- Check that temporary file directory `/tmp` is writable
- Verify Python version is 3.8 or higher

### Gateway Issues

- Ensure Node.js version is 16 or higher
- Check that backend is running on port 8000
- Verify CORS settings if accessing from different domain

### Frontend Issues

- Clear browser cache and reload
- Check browser console for errors
- Ensure gateway is running on port 3001
- Update `.env` file if using custom gateway URL

## 📝 Environment Variables

### Frontend (`.env` file in `/frontend`)

```bash
VITE_GATEWAY_URL=http://localhost:3001
```

### Gateway (environment variables)

```bash
PORT=3001
FASTAPI_URL=http://localhost:8000
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 👥 Authors

- Signal Forge Development Team

## 🙏 Acknowledgments

- FastAPI framework
- React and Vite
- Recharts for visualizations
- Scientific Python stack (NumPy, SciPy, Matplotlib)
- HDF5, NetCDF, and EDF libraries

---

**Signal Forge Phase-45R4 Lab** · Quantum Collapse Analysis System
