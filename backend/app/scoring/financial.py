"""
Financial stress subscorer.

Outputs a stress score 0–100 (100 = maximum financial stress).

Inputs:
  monthly_income_usd      — gross monthly income
  monthly_remittance_usd  — amount sent home per month
  total_debt_usd          — total outstanding debt
  income_stability        — 0 (unstable) to 1 (fully stable)

Reference thresholds (Nepali diaspora context):
  Remittance burden (remittance / income):
    <10%  → low       (score ~0–20)
    10–20% → moderate (score ~20–50)
    20–30% → elevated (score ~50–75)
    >30%  → severe    (score ~75–100)

  Debt-to-monthly-income ratio:
    <2x   → low
    2–4x  → moderate
    4–6x  → elevated
    >6x   → severe

  Income stability:
    1.0 → 0 stress contribution
    0.0 → 100 stress contribution
"""

import numpy as np


def _remittance_stress(monthly_income: float, monthly_remittance: float) -> float:
    if monthly_income <= 0:
        return 100.0
    pct = monthly_remittance / monthly_income
    if pct <= 0.10:
        return float(np.interp(pct, [0, 0.10], [0, 20]))
    if pct <= 0.20:
        return float(np.interp(pct, [0.10, 0.20], [20, 50]))
    if pct <= 0.30:
        return float(np.interp(pct, [0.20, 0.30], [50, 75]))
    return float(np.clip(75 + (pct - 0.30) * 250, 75, 100))


def _debt_stress(monthly_income: float, total_debt: float) -> float:
    if monthly_income <= 0:
        return 100.0 if total_debt > 0 else 0.0
    ratio = total_debt / monthly_income  # debt in months of income
    if ratio <= 2:
        return float(np.interp(ratio, [0, 2], [0, 20]))
    if ratio <= 4:
        return float(np.interp(ratio, [2, 4], [20, 50]))
    if ratio <= 6:
        return float(np.interp(ratio, [4, 6], [50, 75]))
    return float(np.clip(75 + (ratio - 6) * 5, 75, 100))


def _stability_stress(income_stability: float) -> float:
    return float(np.clip((1.0 - income_stability) * 100, 0, 100))


def score_financial(
    monthly_income_usd: float,
    monthly_remittance_usd: float,
    total_debt_usd: float,
    income_stability: float,
) -> float:
    """
    Weighted composite of remittance burden, debt load, and income stability.
    Returns 0–100 (100 = maximum stress).
    """
    remittance = _remittance_stress(monthly_income_usd, monthly_remittance_usd)
    debt = _debt_stress(monthly_income_usd, total_debt_usd)
    stability = _stability_stress(income_stability)

    composite = 0.50 * remittance + 0.30 * debt + 0.20 * stability
    return float(np.clip(composite, 0, 100))
