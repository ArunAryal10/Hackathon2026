# MannChill — मनशान्ति

A stress-awareness tool built for the Nepali diaspora.

MannChill measures **allostatic load** — the cumulative physiological and psychological cost of chronic stress — across financial, physical, behavioral, and self-reported dimensions. It then surfaces actionable nudges adapted to the cultural context of Nepali life abroad.

> Not a clinical diagnostic tool. Designed to inform, not alarm.

---

## Why this exists

Mental health tools rarely account for the specific pressures facing diaspora communities. For Nepali people living abroad, remittance burden — often 20–35% of income sent home to family — is one of the most consistent predictors of elevated stress. Standard wellness apps don't model this. MannChill does.

The scoring engine weights financial stress at 40%, reflecting research on how remittance obligations interact with debt, income instability, and long-term wellbeing. Nudges are written to respect *izzat* (इज्जत) — the value placed on family honor — rather than dismissing the obligation.

---

## What it measures

| Component | Weight | Signals |
|-----------|--------|---------|
| Financial | 40% | Remittance-to-income ratio, debt load, income stability |
| HRV + Sleep | 25% | RMSSD (ms), sleep duration, sleep efficiency |
| Behavioral | 20% | Screen time, daily steps, weekly exercise |
| Self-Report | 15% | Mood rating, stress rating (1–10) |

Scores map to four bands: **Low → Moderate → High → Severe**, with K6-equivalent labels for clinical reference.

---

## App flow

1. **Landing** — context on Nepali diaspora mental health and what the app measures
2. **Intake** — enter data manually or load a demo profile (high stress / moderate stress)
3. **Dashboard** — allostatic load gauge, sub-score breakdown, culturally-adapted nudges
4. **Resources** — tiered support resources matched to stress band, including Nepali-language helplines

---

## Stack

| Layer | Tech |
|-------|------|
| Backend | FastAPI, Python 3.11, NumPy, Pydantic |
| Frontend | React + Vite + Tailwind CSS + Recharts |
| Deploy | Vercel (frontend), Railway (backend) |

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

### API endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/score` | Compute allostatic load from input data |
| `GET` | `/api/demo/{profile}` | Load synthetic profile (`profile_a` or `profile_b`) |
| `GET` | `/api/resources/{band}` | Fetch resources for a stress band |
| `GET` | `/health` | Health check |

---

## Demo profiles

Two synthetic profiles are included for end-to-end testing:

**Profile A — High stress**
Freelance income, 35% remittance burden, HRV 22ms, 5.5h sleep, 9h screen time daily.

**Profile B — Moderate stress**
Stable employment, 18% remittance burden, HRV 42ms, 7h sleep, 5h screen time daily.

---

## Nudge design principles

- Lead with the person's situation, not a diagnosis
- Acknowledge family obligation before suggesting change
- Bilingual where possible (English + Nepali)
- Escalate to crisis resources only when the score warrants it — and do so clearly

---

## Team

Built at Hackathon 2026.