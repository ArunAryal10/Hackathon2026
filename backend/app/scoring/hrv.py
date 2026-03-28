"""
HRV + sleep subscorer.

Outputs a stress score 0–100 (100 = maximum physiological stress).

Reference ranges:
  RMSSD:            <20ms = severe, 20-40 = elevated, 40-60 = normal, >60 = optimal
  Sleep duration:   <5h = severe, 5-6 = elevated, 7-9 = optimal, >9 = neutral
  Sleep efficiency: <70% = severe, 70-80 = elevated, >85 = optimal
"""

import numpy as np


def _rmssd_stress(rmssd: float) -> float:
    """Map RMSSD (ms) to stress component 0–100."""
    if rmssd <= 0:
        return 100.0
    if rmssd >= 80:
        return 0.0
    # Piecewise linear: 80ms → 0, 40ms → 30, 20ms → 70, 5ms → 100
    breakpoints = [(80, 0), (40, 30), (20, 70), (5, 100), (0, 100)]
    for i in range(len(breakpoints) - 1):
        x1, y1 = breakpoints[i]
        x2, y2 = breakpoints[i + 1]
        if rmssd >= x2:
            t = (rmssd - x2) / (x1 - x2)
            return float(np.clip(y2 + t * (y1 - y2), 0, 100))
    return 100.0


def _sleep_duration_stress(hrs: float) -> float:
    """Map sleep duration (hours) to stress component 0–100."""
    if 7.0 <= hrs <= 9.0:
        return 0.0
    if hrs < 5.0:
        return 100.0
    if 5.0 <= hrs < 7.0:
        t = (hrs - 5.0) / 2.0
        return float(70.0 - 70.0 * t)
    # 9–11h: mild upward (oversleeping associated with depression)
    if hrs <= 11.0:
        t = (hrs - 9.0) / 2.0
        return float(20.0 * t)
    return 20.0


def _sleep_efficiency_stress(pct: float) -> float:
    """Map sleep efficiency (%) to stress component 0–100."""
    if pct >= 85:
        return 0.0
    if pct < 60:
        return 100.0
    # Linear between 60%→100 and 85%→0
    return float(np.clip(100.0 - (pct - 60.0) * (100.0 / 25.0), 0, 100))


def score_hrv_sleep(rmssd_ms: float, sleep_duration_hrs: float, sleep_efficiency_pct: float) -> float:
    """
    Weighted composite of HRV and sleep components.
    Returns 0–100 (100 = maximum stress).
    """
    hrv_score = _rmssd_stress(rmssd_ms)
    dur_score = _sleep_duration_stress(sleep_duration_hrs)
    eff_score = _sleep_efficiency_stress(sleep_efficiency_pct)

    # Weights: HRV is the strongest signal
    composite = 0.50 * hrv_score + 0.30 * dur_score + 0.20 * eff_score
    return float(np.clip(composite, 0, 100))
