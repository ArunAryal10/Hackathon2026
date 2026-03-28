from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel

from app.models.schemas import ScoreRequest, ScoreResponse
from app.scoring.engine import compute_score

router = APIRouter(prefix="/api", tags=["scenario"])


class ScenarioRequest(BaseModel):
    inputs: ScoreRequest
    original_score: float


class ScenarioResponse(ScoreResponse):
    score_delta: float


@router.post("/scenario", response_model=ScenarioResponse)
def scenario(req: ScenarioRequest) -> ScenarioResponse:
    result = compute_score(req.inputs)
    delta = round(result.allostatic_load - req.original_score, 1)
    return ScenarioResponse(score_delta=delta, **result.dict())
