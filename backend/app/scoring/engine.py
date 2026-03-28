"""
Allostatic load scoring engine.

Combines all subscorers into a single composite score 0–100.

Weights:
  Financial   40%
  HRV+Sleep   25%
  Behavioral  20%
  Self-report 15%
"""

from __future__ import annotations

import numpy as np

from .hrv import score_hrv_sleep
from .financial import score_financial
from .behavioral import score_behavioral
from app.models.schemas import ScoreRequest, ScoreResponse, SubScores


WEIGHTS = {
    "financial": 0.40,
    "hrv_sleep": 0.25,
    "behavioral": 0.20,
    "self_report": 0.15,
}

BAND_THRESHOLDS = [
    (25,  "low",      "no significant distress"),
    (50,  "moderate", "mild-moderate distress"),
    (75,  "high",     "moderate-severe distress"),
    (101, "severe",   "severe distress"),
]


def _self_report_score(stress_rating: int, mood_rating: int) -> float:
    # stress 1–10 → 0–100, mood inverted (10=good → 0 stress)
    stress_component = (stress_rating - 1) / 9 * 100
    mood_component = (10 - mood_rating) / 9 * 100
    return float(np.clip(0.6 * stress_component + 0.4 * mood_component, 0, 100))


def _band(score: float) -> tuple[str, str]:
    for threshold, band, k6 in BAND_THRESHOLDS:
        if score <= threshold:
            return band, k6
    return "severe", "severe distress"


def _dominant_stressor(sub_scores: dict[str, float]) -> str:
    weighted = {k: sub_scores[k] * WEIGHTS[k] for k in WEIGHTS}
    return max(weighted, key=weighted.get)


def compute_score(req: ScoreRequest) -> ScoreResponse:
    # Use caller-supplied weights if provided, else defaults
    if req.weights:
        w = req.weights
        weights = {
            "financial":   w.financial   if w.financial   is not None else WEIGHTS["financial"],
            "hrv_sleep":   w.hrv_sleep   if w.hrv_sleep   is not None else WEIGHTS["hrv_sleep"],
            "behavioral":  w.behavioral  if w.behavioral  is not None else WEIGHTS["behavioral"],
            "self_report": w.self_report if w.self_report is not None else WEIGHTS["self_report"],
        }
    else:
        weights = WEIGHTS

    hrv_sleep = score_hrv_sleep(
        req.hrv_sleep.rmssd_ms,
        req.hrv_sleep.sleep_duration_hrs,
        req.hrv_sleep.sleep_efficiency_pct,
    )
    financial = score_financial(
        req.financial.monthly_income_usd,
        req.financial.monthly_remittance_usd,
        req.financial.total_debt_usd,
        req.financial.income_stability,
    )
    behavioral = score_behavioral(
        req.behavioral.screen_time_hrs,
        req.behavioral.steps_per_day,
        req.behavioral.exercise_mins_per_week,
    )
    self_report = _self_report_score(
        req.self_report.stress_rating,
        req.self_report.mood_rating,
    )

    sub = {
        "financial": financial,
        "hrv_sleep": hrv_sleep,
        "behavioral": behavioral,
        "self_report": self_report,
    }

    composite = sum(sub[k] * weights[k] for k in weights)
    composite = float(np.clip(composite, 0, 100))

    band, k6 = _band(composite)
    weighted = {k: sub[k] * weights[k] for k in weights}
    dominant = max(weighted, key=weighted.get)

    from app.scoring.nudges import get_nudges
    nudges = get_nudges(dominant, band, sub)

    return ScoreResponse(
        allostatic_load=round(composite, 1),
        band=band,
        k6_equivalent=k6,
        sub_scores=SubScores(
            hrv_sleep=round(hrv_sleep, 1),
            financial=round(financial, 1),
            behavioral=round(behavioral, 1),
            self_report=round(self_report, 1),
        ),
        nudges=nudges,
        dominant_stressor=dominant,
    )
