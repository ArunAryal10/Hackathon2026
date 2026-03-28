import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'

// Default inputs used when navigating directly from NavBar (no dashboard state)
const DEMO_INPUTS = {
  hrv_sleep:    { rmssd_ms: 38, sleep_duration_hrs: 6.5, sleep_efficiency_pct: 78 },
  financial:    { monthly_income_usd: 2000, monthly_remittance_usd: 400, total_debt_usd: 5000, income_stability: 0.7 },
  behavioral:   { screen_time_hrs: 7, steps_per_day: 4500, exercise_mins_per_week: 60 },
  self_report:  { stress_rating: 7, mood_rating: 4 },
}

function scoreColor(v) {
  if (v <= 25) return '#4ade80'
  if (v <= 50) return '#facc15'
  if (v <= 75) return '#fb923c'
  return '#f87171'
}

function SliderField({ label, hint, value, onChange, min, max, step = 1, leftLabel, rightLabel, format }) {
  return (
    <div className="mb-5">
      <div className="flex justify-between mb-1">
        <label className="text-sm font-medium text-gray-300">{label}</label>
        <span className="text-sm font-semibold text-white">{format ? format(value) : value}</span>
      </div>
      {hint && <p className="text-xs text-gray-500 mb-2">{hint}</p>}
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-purple-500"
      />
      <div className="flex justify-between text-xs text-gray-600 mt-1">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  )
}

function DeltaBadge({ delta }) {
  if (delta === null) return null
  const improved = delta < 0
  const color = improved ? 'text-green-400 bg-green-900/30 border-green-800' : delta > 0 ? 'text-red-400 bg-red-900/30 border-red-800' : 'text-gray-400 bg-gray-800 border-gray-700'
  const sign = delta > 0 ? '+' : ''
  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold ${color}`}>
      {improved ? '↓' : delta > 0 ? '↑' : '→'} {sign}{delta} stress points
      {improved && <span className="text-xs font-normal opacity-70">improvement</span>}
    </div>
  )
}

export default function ScenarioPage() {
  const { state } = useLocation()
  const navigate = useNavigate()

  const [baseScore, setBaseScore] = useState(state?.result?.allostatic_load ?? null)
  const [baseInputs] = useState(state?.inputs ?? DEMO_INPUTS)
  const [loadingBase, setLoadingBase] = useState(!state?.result)

  // If no dashboard state, fetch a baseline score from the API using demo defaults
  useEffect(() => {
    if (state?.result) return
    axios.post('/api/score', DEMO_INPUTS)
      .then(res => setBaseScore(res.data.allostatic_load))
      .catch(() => setBaseScore(62.4))  // fallback if backend is down
      .finally(() => setLoadingBase(false))
  }, [])

  const [form, setForm] = useState({
    remittance: baseInputs.financial.monthly_remittance_usd,
    sleep:      baseInputs.hrv_sleep.sleep_duration_hrs,
    steps:      baseInputs.behavioral.steps_per_day,
    exercise:   baseInputs.behavioral.exercise_mins_per_week,
    screen:     baseInputs.behavioral.screen_time_hrs,
    stress:     baseInputs.self_report.stress_rating,
  })

  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  async function runScenario() {
    if (baseScore === null) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const payload = {
        original_score: baseScore,
        inputs: {
          hrv_sleep:   { ...baseInputs.hrv_sleep,   sleep_duration_hrs: form.sleep },
          financial:   { ...baseInputs.financial,   monthly_remittance_usd: form.remittance },
          behavioral:  { ...baseInputs.behavioral,  steps_per_day: form.steps, exercise_mins_per_week: form.exercise, screen_time_hrs: form.screen },
          self_report: { ...baseInputs.self_report, stress_rating: form.stress },
        },
      }
      const { data } = await axios.post('/api/scenario', payload)
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  const income = baseInputs.financial.monthly_income_usd

  if (loadingBase) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading baseline…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        <div className="text-center mb-8">
          <div className="text-3xl mb-2">🔮</div>
          <h1 className="text-2xl font-bold text-white mb-1">What-If Scenarios</h1>
          <p className="text-gray-500 text-xs">Adjust the sliders and see how your stress score changes</p>
        </div>

        {/* Current score reference */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 mb-6 flex items-center justify-between">
          <span className="text-sm text-gray-400">
            {state?.result ? 'Your current score' : 'Demo baseline score'}
          </span>
          <span className="text-2xl font-bold" style={{ color: scoreColor(baseScore) }}>
            {baseScore?.toFixed(1)}
          </span>
        </div>

        {/* Sliders */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-5">💸 Financial</h2>
          <SliderField
            label="Monthly remittance"
            hint={income > 0 ? `${((form.remittance / income) * 100).toFixed(0)}% of income` : undefined}
            value={form.remittance} onChange={v => set('remittance', v)}
            min={0} max={Math.min(income, 2000)} step={50}
            leftLabel="$0" rightLabel={`$${Math.min(income, 2000).toLocaleString()}`}
            format={v => `$${v}`}
          />
        </div>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-5">💓 Sleep</h2>
          <SliderField
            label="Sleep duration"
            value={form.sleep} onChange={v => set('sleep', v)}
            min={4} max={10} step={0.5}
            leftLabel="4 hrs" rightLabel="10 hrs"
            format={v => `${v}h`}
          />
        </div>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-5">📱 Behavioral</h2>
          <SliderField
            label="Daily screen time"
            value={form.screen} onChange={v => set('screen', v)}
            min={1} max={14} step={0.5}
            leftLabel="1 hr" rightLabel="14 hrs"
            format={v => `${v}h`}
          />
          <SliderField
            label="Daily steps"
            value={form.steps} onChange={v => set('steps', v)}
            min={1000} max={15000} step={500}
            leftLabel="1,000" rightLabel="15,000"
            format={v => v.toLocaleString()}
          />
          <SliderField
            label="Exercise (mins/week)"
            value={form.exercise} onChange={v => set('exercise', v)}
            min={0} max={300} step={15}
            leftLabel="0" rightLabel="300 mins"
            format={v => `${v}m`}
          />
        </div>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-5">🧠 Self-report</h2>
          <SliderField
            label="Stress level"
            value={form.stress} onChange={v => set('stress', v)}
            min={1} max={10}
            leftLabel="1 — No stress" rightLabel="10 — Extreme"
          />
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 rounded-lg px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 mb-6 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Projected outcome</p>
            <div className="flex items-center justify-center gap-4 mb-3">
              <span className="text-3xl font-bold" style={{ color: scoreColor(baseScore) }}>
                {baseScore.toFixed(1)}
              </span>
              <span className="text-gray-600 text-xl">→</span>
              <span className="text-3xl font-bold" style={{ color: scoreColor(result.allostatic_load) }}>
                {result.allostatic_load.toFixed(1)}
              </span>
            </div>
            <DeltaBadge delta={result.score_delta} />
            {result.score_delta < 0 && (
              <p className="text-xs text-gray-500 mt-3">
                Primary stressor: <span className="text-white">{result.dominant_stressor}</span>
              </p>
            )}
          </div>
        )}

        <button
          onClick={runScenario}
          disabled={loading || baseScore === null}
          className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900 disabled:text-purple-400 text-white font-semibold transition-colors text-sm mb-3"
        >
          {loading ? 'Calculating…' : 'Run scenario →'}
        </button>

        <button onClick={() => navigate(-1)} className="w-full py-3 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors text-sm">
          ← Back
        </button>

      </div>
    </div>
  )
}
