import { useLocation, useNavigate } from 'react-router-dom'
import { scoreColor } from '../utils/colors'

function RatingDisplay({ label, value, max, lowLabel, highLabel, invert }) {
  // invert: true means high value = bad (stress), false means high value = good (mood)
  const pct = (value / max) * 100
  const color = invert
    ? value >= 8 ? '#f87171' : value >= 6 ? '#fb923c' : value >= 4 ? '#facc15' : '#4ade80'
    : value >= 8 ? '#4ade80' : value >= 6 ? '#facc15' : value >= 4 ? '#fb923c' : '#f87171'

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-700">{label}</span>
        <span className="text-3xl font-bold" style={{ color }}>{value}<span className="text-gray-700 text-base font-normal">/{max}</span></span>
      </div>
      <div className="flex gap-1 mb-2">
        {Array.from({ length: max }).map((_, i) => (
          <div
            key={i}
            className="flex-1 h-3 rounded-sm"
            style={{ backgroundColor: i < value ? color : '#374151' }}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-800">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  )
}

export default function SelfReportPage() {
  const { state } = useLocation()
  const navigate = useNavigate()

  const sr = state?.inputs?.self_report
  const score = state?.result?.sub_scores?.self_report

  if (!sr) { navigate('/'); return null }

  const stress = sr.stress_rating
  const mood = sr.mood_rating

  const combined = stress >= 7 && mood <= 4

  return (
    <div className="min-h-screen bg-cream-100 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        <div className="text-center mb-8">
          <div className="text-3xl mb-2">🧠</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Self-Report</h1>
          <p className="text-gray-700 text-xs">How you rated yourself at intake</p>
          {score !== undefined && (
            <div className="mt-2 inline-block px-3 py-1 rounded-full bg-white text-gray-700 text-xs">
              Sub-score: <span className="font-semibold" style={{ color: scoreColor(score) }}>{Math.round(score)}/100</span> stress load
            </div>
          )}
        </div>

        <RatingDisplay
          label="Stress level"
          value={stress} max={10}
          lowLabel="1 — No stress" highLabel="10 — Extreme"
          invert={true}
        />

        <RatingDisplay
          label="Mood"
          value={mood} max={10}
          lowLabel="1 — Very low" highLabel="10 — Excellent"
          invert={false}
        />

        {combined && (
          <div className="bg-red-900/20 border border-red-800 rounded-2xl p-4 mb-6">
            <p className="text-sm text-red-600 leading-relaxed">
              High stress + low mood together are a meaningful signal. The resources page has
              culturally-grounded support options that may help.
            </p>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-8">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">About self-report</h2>
          <p className="text-gray-700 text-sm leading-relaxed">
            Self-reported stress and mood validate the objective signals from HRV and behavioral data.
            They carry 15% of your total score — meaningful, but balanced against measurable data
            to reduce recency bias.
          </p>
        </div>

        <button onClick={() => navigate(-1)} className="w-full py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-white transition-colors text-sm">
          ← Back
        </button>

      </div>
    </div>
  )
}
