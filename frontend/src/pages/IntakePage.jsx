import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { saveScoreToHistory } from '../utils/permissions'

// Synthetic "today's data" — simulates auto-sync from wearable + phone
// In production these would come from HealthKit / Google Fit / Screen Time APIs
const TODAY = {
  hrv_sleep: { rmssd_ms: 34, sleep_duration_hrs: 6.5, sleep_efficiency_pct: 76 },
  financial: { monthly_income_usd: 2800, monthly_remittance_usd: 560, total_debt_usd: 7500, income_stability: 0.6 },
  behavioral: { screen_time_hrs: 6.5, steps_per_day: 4200, exercise_mins_per_week: 45 },
  self_report: { stress_rating: 6, mood_rating: 5 },
}

// Previous day's data — shown as trend comparison
const YESTERDAY = {
  hrv_sleep: { rmssd_ms: 41, sleep_duration_hrs: 7.0, sleep_efficiency_pct: 82 },
  behavioral: { screen_time_hrs: 5.0, steps_per_day: 6100, exercise_mins_per_week: 45 },
}

function trend(today, yesterday) {
  const diff = today - yesterday
  if (Math.abs(diff) < 0.5) return null
  return diff > 0 ? 'up' : 'down'
}

function TrendBadge({ today, yesterday, higherIsBad = true }) {
  const dir = trend(today, yesterday)
  if (!dir) return null
  const bad = (dir === 'up' && higherIsBad) || (dir === 'down' && !higherIsBad)
  return (
    <span className={`ml-2 text-xs px-1.5 py-0.5 rounded font-medium ${bad ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
      {dir === 'up' ? '↑' : '↓'} vs yesterday
    </span>
  )
}

function Field({ label, hint, children }) {
  return (
    <div className="mb-5">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {hint && <p className="text-xs text-gray-700 mb-2">{hint}</p>}
      {children}
    </div>
  )
}

function Input({ value, onChange, placeholder, type = 'number', min, max, step }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      min={min}
      max={max}
      step={step}
      className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
    />
  )
}

function RangeField({ label, hint, value, onChange, min, max, step = 1, leftLabel, rightLabel }) {
  return (
    <Field label={`${label}: ${value}`} hint={hint}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        className="w-full accent-purple-500"
      />
      <div className="flex justify-between text-xs text-gray-700 mt-1">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </Field>
  )
}

function Section({ title, emoji, source, children }) {
  return (
    <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-100">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-gray-900">
          <span className="mr-2">{emoji}</span>{title}
        </h2>
        {source && <span className="text-xs text-gray-800 bg-white px-2 py-0.5 rounded-full">{source}</span>}
      </div>
      {children}
    </div>
  )
}

export default function IntakePage() {
  const [form, setForm] = useState(TODAY)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  function set(section, field, value) {
    setForm(f => ({ ...f, [section]: { ...f[section], [field]: value } }))
  }

  function num(val) { return val === '' ? 0 : Number(val) }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const payload = {
        hrv_sleep: {
          rmssd_ms: num(form.hrv_sleep.rmssd_ms),
          sleep_duration_hrs: num(form.hrv_sleep.sleep_duration_hrs),
          sleep_efficiency_pct: num(form.hrv_sleep.sleep_efficiency_pct),
        },
        financial: {
          monthly_income_usd: num(form.financial.monthly_income_usd),
          monthly_remittance_usd: num(form.financial.monthly_remittance_usd),
          total_debt_usd: num(form.financial.total_debt_usd),
          income_stability: num(form.financial.income_stability),
        },
        behavioral: {
          screen_time_hrs: num(form.behavioral.screen_time_hrs),
          steps_per_day: num(form.behavioral.steps_per_day),
          exercise_mins_per_week: num(form.behavioral.exercise_mins_per_week),
        },
        self_report: {
          stress_rating: num(form.self_report.stress_rating),
          mood_rating: num(form.self_report.mood_rating),
        },
      }
      const { data } = await axios.post('/api/score', payload)
      saveScoreToHistory(data)
      navigate('/dashboard', { state: { result: data, inputs: payload } })
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  async function loadDemo(profile) {
    setLoading(true)
    setError(null)
    try {
      const { data } = await axios.get(`/api/demo/${profile}`)
      saveScoreToHistory(data)
      navigate('/dashboard', { state: { result: data, demo: profile } })
    } catch (err) {
      setError('Could not load demo. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream-100 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Today's Data</h1>
          <div className="flex items-center justify-center gap-2 text-xs text-gray-700">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
            <span>Auto-synced · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
          </div>
          <p className="text-gray-800 text-xs mt-1">Sources: Apple Health · Screen Time · Manual</p>
        </div>

        {/* Demo shortcuts */}
        <div className="bg-white rounded-2xl p-5 mb-6 border border-brand-200">
          <p className="text-sm text-brand-400 font-medium mb-3">Quick demo — load a synthetic profile</p>
          <div className="flex gap-3">
            <button
              onClick={() => loadDemo('profile_a')}
              className="flex-1 py-2 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm hover:bg-red-100 transition-colors"
            >
              Profile A — High stress
            </button>
            <button
              onClick={() => loadDemo('profile_b')}
              className="flex-1 py-2 rounded-lg bg-green-50 text-green-700 border border-green-200 text-sm hover:bg-green-100 transition-colors"
            >
              Profile B — Moderate stress
            </button>
          </div>
        </div>

        <div className="text-center text-gray-800 text-sm mb-6">— or enter your own data —</div>

        <form onSubmit={handleSubmit}>

          {/* Financial */}
          <Section title="Financial" emoji="💸" source="Manual">
            <Field label="Monthly income (USD)" hint="Your gross monthly income before remittance">
              <Input value={form.financial.monthly_income_usd} placeholder="e.g. 2500"
                onChange={e => set('financial', 'monthly_income_usd', e.target.value)} />
            </Field>
            <Field label="Monthly remittance (USD)" hint="Amount sent home per month">
              <Input value={form.financial.monthly_remittance_usd} placeholder="e.g. 400"
                onChange={e => set('financial', 'monthly_remittance_usd', e.target.value)} />
            </Field>
            <Field label="Total debt (USD)" hint="All outstanding debt combined">
              <Input value={form.financial.total_debt_usd} placeholder="e.g. 8000"
                onChange={e => set('financial', 'total_debt_usd', e.target.value)} />
            </Field>
            <RangeField
              label="Income stability"
              hint="How stable and predictable is your income?"
              value={form.financial.income_stability}
              onChange={e => set('financial', 'income_stability', Number(e.target.value))}
              min={0} max={1} step={0.05}
              leftLabel="Very unstable (freelance)" rightLabel="Fully stable (salaried)"
            />
          </Section>

          {/* HRV + Sleep */}
          <Section title="HRV & Sleep" emoji="💓" source="Apple Health">
            <Field label={<>HRV — RMSSD (ms) <TrendBadge today={form.hrv_sleep.rmssd_ms} yesterday={YESTERDAY.hrv_sleep.rmssd_ms} higherIsBad={false} /></>}>
              <Input value={form.hrv_sleep.rmssd_ms} placeholder="e.g. 38"
                onChange={e => set('hrv_sleep', 'rmssd_ms', e.target.value)} />
            </Field>
            <Field label={<>Sleep duration (hours) <TrendBadge today={form.hrv_sleep.sleep_duration_hrs} yesterday={YESTERDAY.hrv_sleep.sleep_duration_hrs} higherIsBad={false} /></>}>
              <Input value={form.hrv_sleep.sleep_duration_hrs} placeholder="e.g. 7" min={0} max={24} step={0.5}
                onChange={e => set('hrv_sleep', 'sleep_duration_hrs', e.target.value)} />
            </Field>
            <Field label={<>Sleep efficiency (%) <TrendBadge today={form.hrv_sleep.sleep_efficiency_pct} yesterday={YESTERDAY.hrv_sleep.sleep_efficiency_pct} higherIsBad={false} /></>}>
              <Input value={form.hrv_sleep.sleep_efficiency_pct} placeholder="e.g. 82" min={0} max={100}
                onChange={e => set('hrv_sleep', 'sleep_efficiency_pct', e.target.value)} />
            </Field>
          </Section>

          {/* Behavioral */}
          <Section title="Behavior & Activity" emoji="📱" source="Screen Time">
            <Field label={<>Daily screen time (hours) <TrendBadge today={form.behavioral.screen_time_hrs} yesterday={YESTERDAY.behavioral.screen_time_hrs} higherIsBad={true} /></>}>
              <Input value={form.behavioral.screen_time_hrs} placeholder="e.g. 6" min={0} max={24} step={0.5}
                onChange={e => set('behavioral', 'screen_time_hrs', e.target.value)} />
            </Field>
            <Field label={<>Daily steps <TrendBadge today={form.behavioral.steps_per_day} yesterday={YESTERDAY.behavioral.steps_per_day} higherIsBad={false} /></>}>
              <Input value={form.behavioral.steps_per_day} placeholder="e.g. 5000" min={0}
                onChange={e => set('behavioral', 'steps_per_day', e.target.value)} />
            </Field>
            <Field label="Exercise (minutes/week)">
              <Input value={form.behavioral.exercise_mins_per_week} placeholder="e.g. 90" min={0}
                onChange={e => set('behavioral', 'exercise_mins_per_week', e.target.value)} />
            </Field>
          </Section>

          {/* Self-report */}
          <Section title="How are you feeling?" emoji="🧠">
            <RangeField
              label="Stress level"
              value={form.self_report.stress_rating}
              onChange={e => set('self_report', 'stress_rating', Number(e.target.value))}
              min={1} max={10}
              leftLabel="1 — No stress" rightLabel="10 — Extreme stress"
            />
            <RangeField
              label="Mood"
              value={form.self_report.mood_rating}
              onChange={e => set('self_report', 'mood_rating', Number(e.target.value))}
              min={1} max={10}
              leftLabel="1 — Very low" rightLabel="10 — Excellent"
            />
          </Section>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-brand-500 hover:bg-brand-400 disabled:bg-purple-900 disabled:text-brand-500 text-gray-900 font-semibold text-base transition-colors"
          >
            {loading ? 'Calculating…' : 'Calculate my score →'}
          </button>

        </form>
      </div>
    </div>
  )
}
