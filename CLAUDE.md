# MannChill — Claude Code Context

Mental health nudging app for the Nepali diaspora. Decomposes allostatic load into financial,
physiological, and behavioral components. Outputs a score + culturally-adapted actionable nudges.
**Not a clinical diagnostic tool.**

> **Demo priority:** Build a tangible, workable demo with synthetic data. All flows must be completable end-to-end.

---

## Stack

| Layer     | Tech                                      |
|-----------|-------------------------------------------|
| Backend   | FastAPI, Python 3.11, NumPy, pandas       |
| Frontend  | React + Vite + Tailwind CSS + Recharts    |
| Deploy    | Vercel (frontend), Railway (backend)      |

---

## App flow — 12–13 pages (all scrollable)

| # | Page | Description |
|---|------|-------------|
| 1 | **Landing / Onboarding** | App purpose, significance, stats on Nepali diaspora mental health, value prop, list of permissions required |
| 2 | **Sign Up / Login** | Phone or email login; age (years + month only) |
| 3 | **Permissions + Plan** | "I agree to…" consent screen; plan selection: Basic or Premium |
| 4 | **Model Calibration** | Based on granted permissions, calibrate the prediction model (collect initial data or synthetic defaults) |
| 5 | **Home Page** (scroll-based) | Stress marker — high-resolution spectrum slider/gauge; all available data visualized clearly |
| 6 | **Data Sources Overview** | Connected apps: wearable, phone usage, journal, bank/card |
| 7 | **HRV + Sleep Detail** | Wearable data visualization |
| 8 | **Financial Stress Detail** | Remittance burden, debt, income breakdown |
| 9 | **Behavioral Detail** | Screen time, steps, exercise |
| 10 | **Self-Report / Journal** | Mood + stress rating; imported journal entries |
| 11 | **Routine Builder** | Scroll-based; checklist of actions for the week |
| 12 | **Nudges + Resources** | Culturally-adapted scripts, resources by severity band |
| 13 | **Settings / Profile** | Manage permissions, data connections, plan |

---

## Home page (Page 5) — key requirements

- **Stress spectrum marker:** high-resolution, slider-style — shows allostatic load on a continuous spectrum, not just a number
- All available data sources visualized in summary cards (scroll down to see each)
- Below data cards: **Routine section** with weekly checklist (actionable items, checkable throughout the week)

---

## Data sources (leverage existing app data wherever possible)

| Source | Data | Integration |
|--------|------|-------------|
| Wearables (Apple Watch, Fitbit, Garmin) | HRV, sleep duration, sleep efficiency, steps | HealthKit / Health Connect API |
| Phone settings | Screen time, app usage | iOS Screen Time / Android Digital Wellbeing |
| Journal apps | Mood entries, stress notes | Import (manual for MVP) |
| Bank / credit card | Spending, remittance transactions | Plaid API (or manual input for demo) |

> **For the demo:** Use synthetic data for all sources. Hardcode realistic Nepali diaspora profiles.

---

## Synthetic data profiles (for demo)

Create at least 2 demo profiles:

**Profile A — High stress:**
- Remittance: 35% of income, debt-to-income 5x, unstable freelance income
- HRV RMSSD: 22ms, sleep 5.5h, efficiency 72%
- Screen time: 9h/day, steps 3000, exercise 20min/week
- Self-report: stress 8/10, mood 3/10

**Profile B — Moderate stress:**
- Remittance: 18% of income, debt-to-income 2x, stable employment
- HRV RMSSD: 42ms, sleep 7h, efficiency 83%
- Screen time: 5h/day, steps 6500, exercise 90min/week
- Self-report: stress 5/10, mood 6/10

---

## API endpoints

| Method | Path | Owner | Status |
|--------|------|-------|--------|
| POST | `/api/score` | Person A | in progress |
| POST | `/api/scenario` | Person B | not started |
| GET | `/api/resources/{band}` | Person B | not started |
| GET | `/api/demo/{profile}` | Person A | not started |

### POST /api/score — request shape
```json
{
  "hrv_sleep": { "rmssd_ms": 38.0, "sleep_duration_hrs": 6.5, "sleep_efficiency_pct": 78 },
  "financial": { "monthly_income_usd": 2000, "monthly_remittance_usd": 400,
                 "total_debt_usd": 5000, "income_stability": 0.7 },
  "behavioral": { "screen_time_hrs": 7, "steps_per_day": 4500, "exercise_mins_per_week": 60 },
  "self_report": { "stress_rating": 7, "mood_rating": 4 }
}
```

### POST /api/score — response shape
```json
{
  "allostatic_load": 62.4,
  "band": "moderate",
  "k6_equivalent": "mild-moderate distress",
  "sub_scores": { "hrv_sleep": 55.0, "financial": 70.0, "behavioral": 45.0, "self_report": 60.0 },
  "dominant_stressor": "financial",
  "nudges": [
    { "category": "financial", "priority": 1,
      "message_en": "Your remittance is 20% of income — above the 15% threshold linked to elevated stress.",
      "message_ne": "तपाईंको रेमिट्यान्स आम्दानीको २०% छ।" }
  ]
}
```

### GET /api/demo/{profile}
Returns full pre-populated score response for `profile_a` or `profile_b`. Used by frontend to load demo without real user input.

---

## Scoring weights (MVP)

| Component | Weight |
|-----------|--------|
| Financial | 40% |
| HRV | 25% |
| Sleep | 20% |
| Self-report | 15% |

K6 band mapping: 0–25 → low, 26–50 → moderate, 51–75 → high, 76–100 → severe.

---

## Team ownership

**Person A — Score engine + Dashboard + Demo data**
- `backend/app/scoring/` — all subscorers + engine.py
- `backend/app/routers/score.py`
- `backend/data/synthetic_profiles.json` — demo profiles A and B
- `backend/app/routers/demo.py` — GET /api/demo/{profile}
- Frontend pages 1–5: Landing, Login, Permissions, Calibration, Home page (stress spectrum + data cards)

**Person B — Scenario + Resources + Routine**
- `backend/app/routers/scenario.py`, `resources.py`
- `backend/data/benchmarks.json`, `resources.json`, `scripts.json`
- Frontend pages 6–12: Data source detail views, Routine builder, Nudges/resources panel

---

## Cultural context

- **Izzat (इज्जत):** honor/respect — renegotiation scripts must acknowledge family obligation
- **Remittance pressure** is the #1 culturally salient stressor for Nepali diaspora
- Nudges should feel supportive, not clinical. Avoid "you are at risk."
- Bilingual (English + Nepali) is a goal, not MVP requirement

---

## Running locally

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev
```

---

## Current status (update as you go)

- [x] Repo scaffolded
- [x] Pydantic schemas defined (`backend/app/models/schemas.py`)
- [x] HRV subscorer drafted (`backend/app/scoring/hrv.py`)
- [ ] Financial subscorer
- [ ] Behavioral subscorer
- [ ] Scoring engine (weights + composite)
- [ ] Synthetic demo profiles + `/api/demo/{profile}` endpoint
- [ ] FastAPI main + routers wired
- [ ] Frontend scaffold (Vite + Tailwind)
- [ ] Pages 1–4 (Landing, Login, Permissions, Calibration)
- [ ] Page 5: Home — stress spectrum marker + data cards
- [ ] Routine builder (Page 11)
- [ ] Nudges/resources panel (Page 12)
- [ ] End-to-end demo flow (Profile A + Profile B)
- [ ] Deployment
