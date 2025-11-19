from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse

from .core.config import settings
from .routers import health, predict, spectro, surface
try:
    from .routers import uploads
except ImportError:
    uploads = None

app = FastAPI(title=settings.APP_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["health"], include_in_schema=False)
def root():
    """
    Simple root endpoint so load balancer health checks hitting "/" succeed.
    """
    return {"ok": True}


# All routes live under /api/v1
app.include_router(health.router, prefix=settings.API_PREFIX, tags=["health"])
app.include_router(predict.router, prefix=settings.API_PREFIX, tags=["predict"])
app.include_router(spectro.router, prefix=settings.API_PREFIX, tags=["spectrogram"])
app.include_router(surface.router, prefix=settings.API_PREFIX, tags=["psi-surface"])
if uploads is not None:
    app.include_router(uploads.router, prefix=settings.API_PREFIX, tags=["uploads"])

# Prometheus metrics (simple exposure; counters can be added later)
try:
    from prometheus_client import generate_latest, CONTENT_TYPE_LATEST

    @app.get("/metrics", include_in_schema=False)
    def metrics():
        return PlainTextResponse(generate_latest(), media_type=CONTENT_TYPE_LATEST)
except Exception:
    pass
