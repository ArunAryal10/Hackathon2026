import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const INITIAL = {
  hrv_sleep: { rmssd_ms: '', sleep_duration_hrs: '', sleep_efficiency_pct: '' },
  financial: { monthly_income_usd: '', monthly_remittance_usd: '', total_debt_usd: '', income_stability: 0.7 },
  behavioral: { screen_time_hrs: '', steps_per_day: '', exercise_mins_per_week: '' },
  self_report: { stress_rating: 5, mood_rating: 5 },
}

function Field({ label, hint, children }) {
  return (
    <div className="mb-5">
      <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
      {hint && <p className="text-xs text-gray-500 mb-2">{hint}</p>}
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
      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
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
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </Field>
  )
}

function Section({ title, emoji, children }) {
  return (
    <div className="bg-gray-900 rounded-2xl p-6 mb-6 border border-gray-800">
      <h2 className="text-lg font-semibold text-white mb-5">
        <span className="mr-2">{emoji}</span>{title}
      </h2>
      {children}
    </div>
  )
}

export default function IntakePage() {
  const [form, setForm] = useState(INITIAL)
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
      navigate('/dashboard', { state: { result: data, demo: profile } })
    } catch (err) {
      setError('Could not load demo. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">MannChill</h1>
          <p className="text-gray-400 text-sm">Enter your data to calculate your allostatic load score.</p>
        </div>

        {/* Demo shortcuts */}
        <div className="bg-gray-900 rounded-2xl p-5 mb-6 border border-purple-900">
          <p className="text-sm text-purple-300 font-medium mb-3">Quick demo — load a synthetic profile</p>
          <div className="flex gap-3">
            <button
              onClick={() => loadDemo('profile_a')}
              className="flex-1 py-2 rounded-lg bg-red-900/40 text-red-300 border border-red-800 text-sm hover:bg-red-900/60 transition-colors"
            >
              Profile A — High stress
            </button>
            <button
              onClick={() => loadDemo('profile_b')}
              className="flex-1 py-2 rounded-lg bg-green-900/40 text-green-300 border border-green-800 text-sm hover:bg-green-900/60 transition-colors"
            >
              Profile B — Moderate stress
            </button>
          </div>
        </div>

        <div className="text-center text-gray-600 text-sm mb-6">— or enter your own data —</div>

        <form onSubmit={handleSubmit}>

          {/* Financial */}
          <Section title="Financial" emoji="💸">
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
          <Section title="HRV & Sleep" emoji="💓">
            <Field label="HRV — RMSSD (ms)" hint="Check your wearable app (Apple Health, Garmin, Fitbit). Typical range: 20–80ms.">
              <Input value={form.hrv_sleep.rmssd_ms} placeholder="e.g. 38"
                onChange={e => set('hrv_sleep', 'rmssd_ms', e.target.value)} />
            </Field>
            <Field label="Sleep duration (hours)" hint="Average hours of sleep per night this week">
              <Input value={form.hrv_sleep.sleep_duration_hrs} placeholder="e.g. 7" min={0} max={24} step={0.5}
                onChange={e => set('hrv_sleep', 'sleep_duration_hrs', e.target.value)} />
            </Field>
            <Field label="Sleep efficiency (%)" hint="% of time in bed actually asleep. Check your wearable or estimate.">
              <Input value={form.hrv_sleep.sleep_efficiency_pct} placeholder="e.g. 82" min={0} max={100}
                onChange={e => set('hrv_sleep', 'sleep_efficiency_pct', e.target.value)} />
            </Field>
          </Section>

          {/* Behavioral */}
          <Section title="Behavior & Activity" emoji="📱">
            <Field label="Daily screen time (hours)" hint="Check phone settings → Screen Time / Digital Wellbeing">
              <Input value={form.behavioral.screen_time_hrs} placeholder="e.g. 6" min={0} max={24} step={0.5}
                onChange={e => set('behavioral', 'screen_time_hrs', e.target.value)} />
            </Field>
            <Field label="Daily steps" hint="Average steps per day this week">
              <Input value={form.behavioral.steps_per_day} placeholder="e.g. 5000" min={0}
                onChange={e => set('behavioral', 'steps_per_day', e.target.value)} />
            </Field>
            <Field label="Exercise (minutes/week)" hint="Total minutes of moderate exercise per week">
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
            <div className="bg-red-900/30 border border-red-700 text-red-300 rounded-lg px-4 py-3 mb-4 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900 disabled:text-purple-400 text-white font-semibold text-base transition-colors"
          >
            {loading ? 'Calculating…' : 'Calculate my score →'}
          </button>

        </form>
      </div>
    </div>
  )
}
