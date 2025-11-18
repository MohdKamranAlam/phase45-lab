# Phase45 Deployment Guide

This project is deployed as three components:

1. **FastAPI service** (Elastic Beanstalk, Python 3.11) – performs ML inference
2. **Node.js gateway** (Elastic Beanstalk, Node.js 22) – handles uploads, proxies to FastAPI, exposes `/api/*` to the UI
3. **React + Vite frontend** (AWS Amplify Hosting) – user interface

The diagram below summarizes the flow:

```
Browser (Amplify) -> Node gateway (Express) -> FastAPI service -> Models
```

## Environment variables

### FastAPI (Elastic Beanstalk)
- Configure CORS middleware to allow requests from the Node gateway domain and Amplify domain.
- No additional env vars are needed beyond your model configuration.

### Node gateway (Elastic Beanstalk)
Set these in **Configuration → Software**:

| Variable | Example value | Notes |
| --- | --- | --- |
| `FASTAPI_URL` | `https://phase45-fastapi-py311.eba-vqjfbnfj5.ap-south-1.elasticbeanstalk.com/api/v1` | Node service forwards all ML calls here |
| `ALLOWED_ORIGINS` | `https://phase45-frontend.amplifyapp.com,http://localhost:5173` | Must include Amplify + local dev origins |
| `PORT` | `8080` | Optional override |
| `MAX_FILE_MB` | `500` | Controls upload limit |

### Frontend (Amplify)
Add these in **App settings → Advanced settings**:

| Variable | Value |
| --- | --- |
| `VITE_API_BASE` | `https://phase45-backend-env.eba-2ae2qfas.ap-south-1.elasticbeanstalk.com` |
| `VITE_API_BASE_URL` | *(optional)* legacy key that maps to the same value |
| `AMPLIFY_MONOREPO_APP_ROOT` | `frontend` | Already provided in `amplify.yml` but kept for clarity |

Only variables prefixed with `VITE_` are exposed to the React code.

## Deployment checklist

1. **FastAPI**
   - Deploy latest code to Elastic Beanstalk (`phase45-fastapi-py311`).
   - Confirm health = green and `https://<fastapi-domain>/api/v1/health` responds.

2. **Node gateway**
   - Deploy to Elastic Beanstalk (`phase45-backend-env`).
   - Update env vars above and restart the environment.
   - Verify `https://<node-domain>/api/health` returns `{ ok: true }` and proxy endpoints reach FastAPI (check logs).

3. **Frontend**
   - Ensure `frontend/.env` contains the same `VITE_API_BASE` value for local testing.
   - Amplify: connect the GitHub repo, set monorepo root to `frontend`, keep auto-detected build command `npm run build`, and use the provided `amplify.yml`.
   - Add the frontend env vars under **Advanced settings** and pick the latest Amazon Linux 2023 build image.
   - Click **Save and deploy**. Pushes to the selected branch will trigger redeploys automatically.

4. **Post-deploy validation**
   - Open the Amplify domain and walk through uploads/predict/spectrogram features.
   - If requests fail due to CORS, add the Amplify domain to `ALLOWED_ORIGINS` in the Node gateway environment.
   - Monitor Elastic Beanstalk logs for errors.

Refer to `.env.example` files in each package for the exact variable names and sample values.
