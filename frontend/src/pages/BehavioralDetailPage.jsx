import { useLocation, useNavigate } from 'react-router-dom'
import { scoreColor } from '../utils/colors'

function MetricBar({ icon, label, value, displayValue, max, target, targetLabel, goodDirection }) {
  // goodDirection: 'high' means more is better, 'low' means less is better
  const pct = Math.min((value / max) * 100, 100)
  const targetPct = Math.min((target / max) * 100, 100)
  const isGood = goodDirection === 'high' ? value >= target : value <= target
  const color = isGood ? '#4ade80' : value / target > (goodDirection === 'high' ? 0.7 : 1.3) ? '#facc15' : '#f87171'

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <span className="text-sm text-gray-700">{label}</span>
        </div>
        <span className="text-xl font-bold" style={{ color }}>{displayValue}</span>
      </div>
      <div className="relative h-3 bg-white rounded-full overflow-hidden mb-1">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
        <div className="absolute top-0 h-full w-0.5 bg-white/40" style={{ left: `${targetPct}%` }} />
      </div>
      <p className="text-xs text-gray-800">Target: {targetLabel}</p>
    </div>
  )
}

export default function BehavioralDetailPage() {
  const { state } = useLocation()
  const navigate = useNavigate()

  const beh = state?.inputs?.behavioral
  const score = state?.result?.sub_scores?.behavioral

  if (!beh) { navigate('/'); return null }

  const screen = beh.screen_time_hrs
  const steps = beh.steps_per_day
  const exercise = beh.exercise_mins_per_week

  return (
    <div className="min-h-screen bg-cream-100 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        <div className="text-center mb-8">
          <div className="text-3xl mb-2">📱</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Behavioral Health</h1>
          <p className="text-gray-700 text-xs">Activity & screen habits</p>
          {score !== undefined && (
            <div className="mt-2 inline-block px-3 py-1 rounded-full bg-white text-gray-700 text-xs">
              Sub-score: <span className="font-semibold" style={{ color: scoreColor(score) }}>{Math.round(score)}/100</span> stress load
            </div>
          )}
        </div>

        <MetricBar
          icon="📱" label="Daily screen time"
          value={screen} displayValue={`${screen}h`}
          max={16} target={4} targetLabel="≤ 4 hrs/day"
          goodDirection="low"
        />
        <MetricBar
          icon="👟" label="Steps per day"
          value={steps} displayValue={steps.toLocaleString()}
          max={12000} target={8000} targetLabel="≥ 8,000 steps"
          goodDirection="high"
        />
        <MetricBar
          icon="🏃" label="Exercise per week"
          value={exercise} displayValue={`${exercise}m`}
          max={300} target={150} targetLabel="≥ 150 mins/week (WHO)"
          goodDirection="high"
        />

        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-8">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Why this matters</h2>
          <p className="text-gray-700 text-sm leading-relaxed">
            High screen time combined with low physical activity is associated with elevated cortisol and
            disrupted sleep (Weatherson et al., 2022). The WHO recommends ≥150 min/week of moderate exercise
            (Bull et al., 2020). Regular moderate-intensity exercise over 8–12 weeks measurably improves HRV
            and reduces baseline cortisol (Dong et al., 2024). Post-meal walking reduces blood glucose spikes
            (DiPietro et al., 2013).
          </p>
        </div>

        <button onClick={() => navigate(-1)} className="w-full py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-white transition-colors text-sm">
          ← Back
        </button>

      </div>
    </div>
  )
}
