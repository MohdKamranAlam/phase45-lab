const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');

const app = express();
const PORT = process.env.PORT || 3001;
const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', service: 'gateway' });
});

// Proxy health check to FastAPI
app.get('/api/backend/health', async (req, res) => {
  try {
    const response = await axios.get(`${FASTAPI_URL}/health`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ 
      error: 'Backend unavailable', 
      message: error.message 
    });
  }
});

// File upload and analysis endpoint
app.post('/api/analyze', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Create form data to forward to FastAPI
    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    // Forward request to FastAPI
    const response = await axios.post(`${FASTAPI_URL}/analyze`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    res.json(response.data);
  } catch (error) {
    console.error('Analysis error:', error.message);
    
    if (error.response) {
      res.status(error.response.status).json({
        error: 'Analysis failed',
        message: error.response.data.detail || error.message,
      });
    } else {
      res.status(500).json({
        error: 'Internal server error',
        message: error.message,
      });
    }
  }
});

// Get KPIs
app.get('/api/kpis', async (req, res) => {
  try {
    const response = await axios.get(`${FASTAPI_URL}/kpis`);
    res.json(response.data);
  } catch (error) {
    console.error('KPIs error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch KPIs',
      message: error.message,
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Gateway server running on port ${PORT}`);
  console.log(`FastAPI backend URL: ${FASTAPI_URL}`);
});
