import json
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

BANDS = {"low", "moderate", "high", "severe"}
DATA_PATH = Path(__file__).parent.parent.parent / "data" / "resources.json"

_cache: Optional[dict] = None


def _load() -> dict:
    global _cache
    if _cache is None:
        with open(DATA_PATH, encoding="utf-8") as f:
            _cache = json.load(f)
    return _cache


class Resource(BaseModel):
    id: str
    category: str
    title_en: str
    title_ne: Optional[str] = None
    description_en: str
    description_ne: Optional[str] = None
    url: str
    type: str
    free: bool
    free_tier: Optional[bool] = None


class ResourcesResponse(BaseModel):
    band: str
    label: str
    message_en: str
    message_ne: Optional[str] = None
    resources: List[Resource]


@router.get("/resources/{band}", response_model=ResourcesResponse)
def get_resources(band: str) -> ResourcesResponse:
    if band not in BANDS:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid band '{band}'. Must be one of: {sorted(BANDS)}",
        )
    data = _load()[band]
    return ResourcesResponse(band=band, **data)
