from fastapi import APIRouter, HTTPException
from app.models.schemas import ScoreRequest, ScoreResponse, HRVSleepInput, FinancialInput, BehavioralInput, SelfReportInput
from app.scoring.engine import compute_score

router = APIRouter(prefix="/api", tags=["demo"])

_PROFILES: dict[str, ScoreRequest] = {
    "profile_a": ScoreRequest(
        hrv_sleep=HRVSleepInput(rmssd_ms=22.0, sleep_duration_hrs=5.5, sleep_efficiency_pct=72.0),
        financial=FinancialInput(
            monthly_income_usd=2200,
            monthly_remittance_usd=770,   # 35% of income
            total_debt_usd=11000,          # 5x monthly income
            income_stability=0.3,
        ),
        behavioral=BehavioralInput(screen_time_hrs=9.0, steps_per_day=3000, exercise_mins_per_week=20.0),
        self_report=SelfReportInput(stress_rating=8, mood_rating=3),
    ),
    "profile_b": ScoreRequest(
        hrv_sleep=HRVSleepInput(rmssd_ms=42.0, sleep_duration_hrs=7.0, sleep_efficiency_pct=83.0),
        financial=FinancialInput(
            monthly_income_usd=3000,
            monthly_remittance_usd=540,   # 18% of income
            total_debt_usd=6000,           # 2x monthly income
            income_stability=0.7,
        ),
        behavioral=BehavioralInput(screen_time_hrs=5.0, steps_per_day=6500, exercise_mins_per_week=90.0),
        self_report=SelfReportInput(stress_rating=5, mood_rating=6),
    ),
    "profile_c": ScoreRequest(
        hrv_sleep=HRVSleepInput(rmssd_ms=65.0, sleep_duration_hrs=8.0, sleep_efficiency_pct=91.0),
        financial=FinancialInput(
            monthly_income_usd=4000,
            monthly_remittance_usd=280,   # 7% of income
            total_debt_usd=2000,           # 0.5x monthly income
            income_stability=0.95,
        ),
        behavioral=BehavioralInput(screen_time_hrs=2.5, steps_per_day=10000, exercise_mins_per_week=180.0),
        self_report=SelfReportInput(stress_rating=2, mood_rating=8),
    ),
}


@router.get("/demo/{profile}", response_model=ScoreResponse)
def demo(profile: str) -> ScoreResponse:
    req = _PROFILES.get(profile)
    if not req:
        raise HTTPException(status_code=404, detail=f"Unknown profile '{profile}'. Use: {list(_PROFILES.keys())}")
    return compute_score(req)
