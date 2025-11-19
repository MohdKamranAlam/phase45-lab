import os
import re
import tempfile
from typing import Tuple

try:
    import boto3
    from botocore.client import Config
except ImportError:  # pragma: no cover - boto3 optional
    boto3 = None
    Config = None

from ..core.config import settings


def _client():
    if boto3 is None or Config is None:
        raise RuntimeError("boto3 is not installed")
    region = settings.AWS_REGION or None
    return boto3.client("s3", region_name=region, config=Config(signature_version="s3v4"))


def _sanitize(name: str) -> str:
    safe = os.path.basename(name or "file")
    safe = re.sub(r"[^a-zA-Z0-9._-]", "_", safe)
    return safe[:80] or "file"


def presign_put(name: str, content_type: str | None = None) -> dict:
    bucket = settings.S3_BUCKET
    if not bucket:
        raise RuntimeError("S3_BUCKET not configured")
    key = f"{settings.S3_PREFIX}{int(__import__('time').time())}_{_sanitize(name)}"
    params = {"Bucket": bucket, "Key": key, "ACL": "private"}
    if content_type:
        params["ContentType"] = content_type
    url = _client().generate_presigned_url(
        ClientMethod="put_object", Params=params, ExpiresIn=900
    )
    return {"url": url, "key": key}


def download_to_tmp(key: str) -> Tuple[str, str]:
    bucket = settings.S3_BUCKET
    if not bucket:
        raise RuntimeError("S3_BUCKET not configured")
    _, name = os.path.split(key)
    _, ext = os.path.splitext(name)
    tmp = tempfile.NamedTemporaryFile(delete=False, dir=settings.UPLOAD_DIR, suffix=ext or "")
    tmp.close()
    _client().download_file(bucket, key, tmp.name)
    return tmp.name, name