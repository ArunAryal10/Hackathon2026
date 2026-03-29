from pydantic import BaseModel, Field
from typing import Optional


class HRVSleepInput(BaseModel):
    rmssd_ms: float = Field(..., ge=0, description="HRV RMSSD in milliseconds")
    sleep_duration_hrs: float = Field(..., ge=0, le=24)
    sleep_efficiency_pct: float = Field(..., ge=0, le=100)


class FinancialInput(BaseModel):
    monthly_income_usd: float = Field(..., ge=0)
    monthly_remittance_usd: float = Field(..., ge=0)
    total_debt_usd: float = Field(..., ge=0)
    income_stability: float = Field(..., ge=0, le=1, description="0=unstable, 1=fully stable")


class BehavioralInput(BaseModel):
    screen_time_hrs: float = Field(..., ge=0, le=24)
    steps_per_day: int = Field(..., ge=0)
    exercise_mins_per_week: float = Field(..., ge=0)


class SelfReportInput(BaseModel):
    stress_rating: int = Field(..., ge=1, le=10, description="1=no stress, 10=extreme stress")
    mood_rating: int = Field(..., ge=1, le=10, description="1=very low, 10=excellent")
    voice_stress: Optional[float] = Field(None, ge=0, le=10, description="Voice-derived stress 0–10; blended with slider score when present")


class WeightsInput(BaseModel):
    hrv_sleep: Optional[float] = None
    financial: Optional[float] = None
    behavioral: Optional[float] = None
    self_report: Optional[float] = None


class ScoreRequest(BaseModel):
    hrv_sleep: HRVSleepInput
    financial: FinancialInput
    behavioral: BehavioralInput
    self_report: SelfReportInput
    weights: Optional[WeightsInput] = None


class SubScores(BaseModel):
    hrv_sleep: float = Field(..., description="0-100, higher = more stress")
    financial: float
    behavioral: float
    self_report: float


class Nudge(BaseModel):
    category: str
    priority: int = Field(..., ge=1, le=3, description="1=high, 2=medium, 3=low")
    message_en: str
    message_ne: Optional[str] = None


class ScoreResponse(BaseModel):
    allostatic_load: float = Field(..., description="Composite score 0-100")
    band: str = Field(..., description="low / moderate / high / severe")
    k6_equivalent: str = Field(..., description="K6 band label")
    sub_scores: SubScores
    nudges: list[Nudge]
    dominant_stressor: str
