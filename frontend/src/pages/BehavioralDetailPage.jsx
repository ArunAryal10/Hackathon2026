import { useLocation, useNavigate } from 'react-router-dom'

function scoreColor(v) {
  if (v <= 25) return '#4ade80'
  if (v <= 50) return '#facc15'
  if (v <= 75) return '#fb923c'
  return '#f87171'
}

function MetricBar({ icon, label, value, displayValue, max, target, targetLabel, goodDirection }) {
  // goodDirection: 'high' means more is better, 'low' means less is better
  const pct = Math.min((value / max) * 100, 100)
  const targetPct = Math.min((target / max) * 100, 100)
  const isGood = goodDirection === 'high' ? value >= target : value <= target
  const color = isGood ? '#4ade80' : value / target > (goodDirection === 'high' ? 0.7 : 1.3) ? '#facc15' : '#f87171'

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <span className="text-sm text-gray-300">{label}</span>
        </div>
        <span className="text-xl font-bold" style={{ color }}>{displayValue}</span>
      </div>
      <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden mb-1">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
        <div className="absolute top-0 h-full w-0.5 bg-white/40" style={{ left: `${targetPct}%` }} />
      </div>
      <p className="text-xs text-gray-600">Target: {targetLabel}</p>
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
    <div className="min-h-screen bg-gray-950 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        <div className="text-center mb-8">
          <div className="text-3xl mb-2">📱</div>
          <h1 className="text-2xl font-bold text-white mb-1">Behavioral Health</h1>
          <p className="text-gray-500 text-xs">Activity & screen habits</p>
          {score !== undefined && (
            <div className="mt-2 inline-block px-3 py-1 rounded-full bg-gray-800 text-gray-300 text-xs">
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

        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 mb-8">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">Why this matters</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            High screen time combined with low physical activity is strongly linked to elevated cortisol and
            disrupted sleep. Even small increases in daily steps (500–1000 more) show measurable HRV improvement
            within 2 weeks.
          </p>
        </div>

        <button onClick={() => navigate(-1)} className="w-full py-3 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors text-sm">
          ← Back
        </button>

      </div>
    </div>
  )
}
