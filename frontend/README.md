# Phase45 Frontend

This folder contains the Phase45 dashboard built with React 19, Vite, Tailwind CSS, and a mix of custom data-visualization components (ECharts, Recharts, Three.js). It is intended to be deployed independently of the FastAPI services that live elsewhere in the monorepo.

## Local development

```bash
cd frontend
npm install
npm run dev
```

The dev server runs on the standard Vite port (5173). Update `.env` values such as `VITE_API_BASE_URL` if the backend endpoints differ per environment.

### Environment variables

Create a `.env` (or `.env.production`) file based on `.env.example` and set one of the following keys:

- `VITE_API_BASE` – preferred key for the Node gateway base URL (e.g., Elastic Beanstalk domain).
- `VITE_API_BASE_URL` – legacy key that is still supported for compatibility.
- `VITE_S3_UPLOADS` – controls whether the React app funnels uploads through S3.
	Accepts `true`, `false`, or `auto` (default). `true` forces the `/from-s3` path, `false` stays on the standard multipart upload, and `auto` enables S3 only when the deployment hostname looks like CloudFront (production).

Only variables prefixed with `VITE_` are exposed to the React app at build time. Access them via `import.meta.env.VITE_API_BASE` in code.

## Production build

```bash
npm run build
npm run preview
```

Assets are emitted into `dist/`, which is the directory exposed when deploying via AWS Amplify or any static host.

## Deploying with AWS Amplify (monorepo)

1. Connect the GitHub repo and pick the branch you wish to publish (e.g., `master`).
2. Enable the **My app is a monorepo** toggle in the Amplify console and set the root to `frontend`.
3. The root `amplify.yml` already pins the build to this app with the following commands:
	 ```yaml
	 version: 1
	 applications:
		 - appRoot: frontend
			 frontend:
				 phases:
					 preBuild:
						 commands:
							 - npm ci
					 build:
						 commands:
							 - npm run build
				 artifacts:
					 baseDirectory: dist
					 files:
						 - '**/*'
				 cache:
					 paths:
						 - node_modules/**/*
	 ```
4. Add any required environment variables in Amplify (e.g., `VITE_API_BASE_URL`).
5. Save and let Amplify run the build; pushes to the selected branch will now trigger automatic redeploys.

## Testing

Lint the project with:

```bash
npm run lint
```

Add component or integration tests under `frontend/src` as the UI evolves.
