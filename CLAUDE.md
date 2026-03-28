# MannChill — Claude Code Context

Mental health nudging app for the Nepali diaspora. Decomposes allostatic load into financial,
physiological, and behavioral components. Outputs a score + culturally-adapted actionable nudges.
**Not a clinical diagnostic tool.**

---

## Stack

| Layer     | Tech                                      |
|-----------|-------------------------------------------|
| Backend   | FastAPI, Python 3.11, NumPy, pandas       |
| Frontend  | React + Vite + Tailwind CSS + Recharts    |
| Deploy    | Vercel (frontend), Railway (backend)      |

---

## Repo structure

```
Hackathon2026/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routers/        # intake.py, score.py, scenario.py, resources.py
│   │   ├── models/         # schemas.py (Pydantic)
│   │   └── scoring/        # engine.py, hrv.py, financial.py, behavioral.py, nudges.py
│   ├── data/               # benchmarks.json, resources.json, scripts.json
│   └── requirements.txt
└── frontend/
    └── src/
        ├── components/     # Dashboard, ScoreGauge, NudgeCard, InputForm, ScenarioSliders
        └── pages/          # IntakePage, DashboardPage, ScenarioPage
```

---

## API endpoints

| Method | Path                      | Owner    | Status      |
|--------|---------------------------|----------|-------------|
| POST   | `/api/score`              | Person A | in progress |
| POST   | `/api/scenario`           | Person B | not started |
| GET    | `/api/resources/{band}`   | Person B | not started |

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

### POST /api/scenario — request shape
Same as `/api/score` — send the modified hypothetical inputs. Returns `score_delta` and new full response.

### GET /api/resources/{band}
`band` is one of: `low` | `moderate` | `high` | `severe`

---

## Scoring weights (MVP)

| Component      | Weight |
|----------------|--------|
| Financial      | 40%    |
| HRV            | 25%    |
| Sleep          | 20%    |
| Self-report    | 15%    |

K6 band mapping: 0–25 → low, 26–50 → moderate, 51–75 → high, 76–100 → severe.

---

## Team ownership

**Person A — Score engine + Dashboard**
- `backend/app/scoring/` — all subscorers + engine.py
- `backend/app/routers/score.py`
- `frontend/src/pages/IntakePage`
- `frontend/src/components/Dashboard`, `ScoreGauge`

**Person B — Scenario + Resources**
- `backend/app/routers/scenario.py`, `resources.py`
- `backend/data/` — all three JSON files
- `frontend/src/pages/ScenarioPage`
- `frontend/src/components/ScenarioSliders`, `NudgeCard`

---

## Cultural context (read before writing nudges or copy)

- **Izzat (इज्जत):** honor/respect — central to why diaspora Nepalis cannot simply cut remittances.
  Renegotiation scripts must acknowledge family obligation while suggesting sustainable limits.
- **Remittance pressure** is the #1 culturally salient financial stressor for this community.
- Nudges should feel supportive, not clinical. Avoid language like "you are at risk."
- Bilingual output (English + Nepali) is a goal, not a requirement for MVP.

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
- [ ] FastAPI main + routers wired
- [ ] Frontend scaffold (Vite + Tailwind)
- [ ] Intake form
- [ ] Dashboard + gauge
- [ ] Scenario sliders
- [ ] Resources/nudge panel
- [ ] End-to-end integration
- [ ] Deployment
