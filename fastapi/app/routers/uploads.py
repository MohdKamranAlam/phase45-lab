from fastapi import APIRouter
from pydantic import BaseModel

from ..services.s3_utils import presign_put


class PresignRequest(BaseModel):
    name: str
    content_type: str | None = None


router = APIRouter()


@router.post("/uploads/presign")
def presign(req: PresignRequest):
    return presign_put(req.name, req.content_type)