import { useLocation, useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { scoreColor, STRESS_COLORS } from '../utils/colors'

const BAND_COLORS = {
  low:      { bg: 'bg-green-900/30',  border: 'border-green-700',  text: 'text-green-400',  hex: STRESS_COLORS.low },
  moderate: { bg: 'bg-yellow-900/30', border: 'border-yellow-700', text: 'text-yellow-400', hex: STRESS_COLORS.moderate },
  high:     { bg: 'bg-orange-900/30', border: 'border-orange-700', text: 'text-orange-400', hex: STRESS_COLORS.high },
  severe:   { bg: 'bg-red-900/30',    border: 'border-red-700',    text: 'text-red-400',    hex: STRESS_COLORS.severe },
}

// ─── Gauge (SVG arc) ───────────────────────────────────────────────────────
function Gauge({ score }) {
  const R = 80
  const cx = 100, cy = 100
  const startAngle = 210   // degrees from 3 o'clock
  const sweepAngle = 120   // half-circle = 180; we use 240 for a wider arc

  function polar(angleDeg, r = R) {
    const rad = (angleDeg * Math.PI) / 180
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)]
  }

  function arcPath(from, to, r = R) {
    const [x1, y1] = polar(from, r)
    const [x2, y2] = polar(to, r)
    const large = to - from > 180 ? 1 : 0
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`
  }

  const end = 210 + (score / 100) * 240  // 210 → 450 (=90 deg)
  const [nx, ny] = polar(end, R - 14)

  return (
    <svg viewBox="0 0 200 160" className="w-52 h-40 mx-auto">
      {/* Track */}
      <path d={arcPath(210, 450)} fill="none" stroke="#374151" strokeWidth="14" strokeLinecap="round" />
      {/* Fill */}
      <path d={arcPath(210, end)} fill="none" stroke={scoreColor(score)} strokeWidth="14" strokeLinecap="round" />
      {/* Needle dot */}
      <circle cx={nx} cy={ny} r="5" fill={scoreColor(score)} />
      {/* Score */}
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="28" fontWeight="bold" fill="white">
        {score.toFixed(1)}
      </text>
      <text x={cx} y={cy + 28} textAnchor="middle" fontSize="10" fill="#9ca3af">
        allostatic load
      </text>
    </svg>
  )
}

// ─── Sub-score bar chart ───────────────────────────────────────────────────
const LABELS = {
  financial:   'Financial',
  hrv_sleep:   'HRV + Sleep',
  behavioral:  'Behavioral',
  self_report: 'Self-report',
}

function SubScoreChart({ subScores }) {
  const data = Object.entries(subScores).map(([key, value]) => ({
    name: LABELS[key] || key,
    score: Math.round(value),
  }))

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20, top: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
        <XAxis type="number" domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 11 }} />
        <YAxis type="category" dataKey="name" tick={{ fill: '#d1d5db', fontSize: 12 }} width={80} />
        <Tooltip
          contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
          labelStyle={{ color: '#f3f4f6' }}
          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
        />
        <Bar dataKey="score" radius={[0, 4, 4, 0]}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={scoreColor(entry.score)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// ─── Nudge card ────────────────────────────────────────────────────────────
const CATEGORY_EMOJI = {
  financial: '💸', hrv_sleep: '💓', behavioral: '📱', self_report: '🧠', crisis: '🆘',
}

function NudgeCard({ nudge }) {
  const band = nudge.priority === 1 ? 'border-purple-700 bg-purple-900/20'
    : nudge.priority === 2 ? 'border-gray-700 bg-gray-800/40'
    : 'border-gray-800 bg-gray-900/30'

  return (
    <div className={`rounded-xl border p-4 mb-3 ${band}`}>
      <div className="flex items-start gap-3">
        <span className="text-xl">{CATEGORY_EMOJI[nudge.category] || '💡'}</span>
        <div>
          <p className="text-sm text-gray-200 leading-relaxed">{nudge.message_en}</p>
          {nudge.message_ne && (
            <p className="text-xs text-gray-500 mt-1">{nudge.message_ne}</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Dashboard page ────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { state } = useLocation()
  const navigate = useNavigate()

  if (!state?.result) {
    navigate('/')
    return null
  }

  const r = state.result
  const band = BAND_COLORS[r.band] || BAND_COLORS.moderate

  const DOMINANT_LABELS = {
    financial: 'Financial stress',
    hrv_sleep: 'Physiological stress (HRV/sleep)',
    behavioral: 'Behavioral patterns',
    self_report: 'Subjective stress',
  }

  return (
    <div className="min-h-screen bg-gray-950 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">MannChill</h1>
          <p className="text-gray-500 text-xs">Allostatic Load Assessment</p>
        </div>

        {/* Score card */}
        <div className={`rounded-2xl border p-6 mb-6 text-center ${band.bg} ${band.border}`}>
          <Gauge score={r.allostatic_load} />
          <div className={`inline-block mt-3 px-4 py-1 rounded-full text-sm font-semibold ${band.bg} ${band.border} border ${band.text}`}>
            {r.band.toUpperCase()} — {r.k6_equivalent}
          </div>
          <p className="text-gray-400 text-sm mt-3">
            Primary stressor: <span className="text-white font-medium">{DOMINANT_LABELS[r.dominant_stressor] || r.dominant_stressor}</span>
          </p>
        </div>

        {/* Sub-score breakdown */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Score breakdown</h2>
          <SubScoreChart subScores={r.sub_scores} />
          <p className="text-xs text-gray-500 mt-3 text-center">
            Weights: Financial 40% · HRV+Sleep 25% · Behavioral 20% · Self-report 15%
          </p>
        </div>

        {/* Nudges */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">What you can do</h2>
          {r.nudges.map((nudge, i) => (
            <NudgeCard key={i} nudge={nudge} />
          ))}
        </div>

        {/* Spectrum context */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 mb-8">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">Stress spectrum</h2>
          <div className="relative h-4 rounded-full overflow-hidden"
            style={{ background: 'linear-gradient(to right, #4ade80, #facc15, #fb923c, #f87171)' }}>
            <div
              className="absolute top-0 w-3 h-4 bg-white rounded-full shadow-lg transition-all"
              style={{ left: `calc(${r.allostatic_load}% - 6px)` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Low (0)</span><span>Moderate (26)</span><span>High (51)</span><span>Severe (76–100)</span>
          </div>
        </div>

        {/* Detail drill-downs */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">Explore details</h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: '💓 HRV & Sleep', path: '/detail/hrv' },
              { label: '💸 Financial', path: '/detail/financial' },
              { label: '📱 Behavioral', path: '/detail/behavioral' },
              { label: '🧠 Self-report', path: '/detail/self-report' },
              { label: '📡 Data sources', path: '/sources' },
              { label: '✅ Weekly routine', path: '/routine' },
              { label: '🔮 What-if scenarios', path: '/scenario' },
            ].map(({ label, path }) => (
              <button
                key={path}
                onClick={() => navigate(path, { state })}
                className="py-2.5 px-3 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-600 transition-colors text-sm text-left"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/resources/${r.band}`)}
            className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-colors text-sm"
          >
            View resources →
          </button>
          <button
            onClick={() => navigate('/intake')}
            className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors text-sm"
          >
            ← Recalculate
          </button>
        </div>

      </div>
    </div>
  )
}
