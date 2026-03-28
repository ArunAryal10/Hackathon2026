from fastapi import APIRouter
from app.models.schemas import ScoreRequest, ScoreResponse
from app.scoring.engine import compute_score

router = APIRouter(prefix="/api", tags=["score"])


@router.post("/score", response_model=ScoreResponse)
def score(req: ScoreRequest) -> ScoreResponse:
    return compute_score(req)
