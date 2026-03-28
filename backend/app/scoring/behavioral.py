"""
Behavioral stress subscorer.

Outputs a stress score 0–100 (100 = maximum behavioral stress load).

Inputs:
  screen_time_hrs         — daily screen time in hours
  steps_per_day           — average daily step count
  exercise_mins_per_week  — total exercise minutes per week

Reference thresholds:
  Screen time:
    <2h   → very low
    2–4h  → low
    4–6h  → moderate
    6–8h  → elevated
    >8h   → severe

  Steps per day:
    >8000 → active (low stress)
    5000–8000 → moderate
    3000–5000 → sedentary (elevated)
    <3000 → very sedentary (severe)

  Exercise mins/week (WHO recommends 150 min moderate):
    >150  → optimal
    75–150 → below recommended
    <75   → sedentary
    0     → none
"""

import numpy as np


def _screen_time_stress(hrs: float) -> float:
    if hrs <= 2:
        return float(np.interp(hrs, [0, 2], [0, 10]))
    if hrs <= 4:
        return float(np.interp(hrs, [2, 4], [10, 30]))
    if hrs <= 6:
        return float(np.interp(hrs, [4, 6], [30, 55]))
    if hrs <= 8:
        return float(np.interp(hrs, [6, 8], [55, 80]))
    return float(np.clip(80 + (hrs - 8) * 5, 80, 100))


def _steps_stress(steps: int) -> float:
    if steps >= 8000:
        return 0.0
    if steps >= 5000:
        return float(np.interp(steps, [5000, 8000], [30, 0]))
    if steps >= 3000:
        return float(np.interp(steps, [3000, 5000], [60, 30]))
    return float(np.interp(steps, [0, 3000], [100, 60]))


def _exercise_stress(mins_per_week: float) -> float:
    if mins_per_week >= 150:
        return 0.0
    if mins_per_week >= 75:
        return float(np.interp(mins_per_week, [75, 150], [40, 0]))
    if mins_per_week > 0:
        return float(np.interp(mins_per_week, [0, 75], [80, 40]))
    return 100.0


def score_behavioral(
    screen_time_hrs: float,
    steps_per_day: int,
    exercise_mins_per_week: float,
) -> float:
    """
    Weighted composite of screen time, physical activity, and exercise.
    Returns 0–100 (100 = maximum stress).
    """
    screen = _screen_time_stress(screen_time_hrs)
    steps = _steps_stress(steps_per_day)
    exercise = _exercise_stress(exercise_mins_per_week)

    composite = 0.35 * screen + 0.35 * steps + 0.30 * exercise
    return float(np.clip(composite, 0, 100))
