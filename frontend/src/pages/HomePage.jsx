import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AreaChart, Area, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'
import axios from 'axios'
import { scoreColor } from '../utils/colors'
import {
  getLastScore, getPermissions, getWeights,
  saveScoreToHistory, STORAGE_KEYS,
} from '../utils/permissions'

// ─── Synthetic trend generators ───────────────────────────────────────────────
function randomWalk(base, steps, maxJitter, trend = 0) {
  let cur = base
  return Array.from({ length: steps }, (_, i) => {
    const drift = (i / steps) * trend
    cur = Math.min(100, Math.max(0, base + drift + (Math.random() - 0.5) * maxJitter))
    return Math.round(cur)
  })
}

function syntheticWeek(base) {
  const today = new Date()
  const scores = randomWalk(base, 7, 10)
  return scores.map((score, i) => {
    const d = new Date(today); d.setDate(d.getDate() - (6 - i))
    return { date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), score }
  })
}

function syntheticMonth(base) {
  const today = new Date()
  const scores = randomWalk(base, 30, 14, -4)
  return scores.map((score, i) => {
    const d = new Date(today); d.setDate(d.getDate() - (29 - i))
    // Only label every 7th point to avoid clutter
    const label = i % 7 === 0
      ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : ''
    return { date: label, score }
  })
}

function syntheticYear(base) {
  const today = new Date()
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const scores = randomWalk(base, 12, 18, -6)
  return scores.map((score, i) => {
    const d = new Date(today); d.setMonth(d.getMonth() - (11 - i))
    return { date: MONTHS[d.getMonth()], score }
  })
}

// ─── Stats row (like Garmin/Whoop) ───────────────────────────────────────────
function TrendStats({ data }) {
  const scores = data.map(d => d.score)
  const min = Math.min(...scores)
  const max = Math.max(...scores)
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  return (
    <div className="grid grid-cols-3 gap-2 mt-4">
      {[
        { label: 'MIN', value: min, color: scoreColor(min) },
        { label: 'AVG', value: avg, color: scoreColor(avg) },
        { label: 'MAX', value: max, color: scoreColor(max) },
      ].map(({ label, value, color }) => (
        <div key={label} className="bg-gray-800/60 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">{label}</p>
          <p className="text-xl font-bold" style={{ color }}>{value}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Trend chart ─────────────────────────────────────────────────────────────
const TABS = ['1W', '1M', '1Y']

function TrendCard({ weekData, monthData, yearData }) {
  const [tab, setTab] = useState('1W')

  const data = tab === '1W' ? weekData : tab === '1M' ? monthData : yearData
  const isYear = tab === '1Y'

  const tooltipStyle = {
    contentStyle: { background: '#111827', border: '1px solid #374151', borderRadius: 8 },
    labelStyle: { color: '#f3f4f6', fontSize: 11 },
    itemStyle: { color: '#a78bfa', fontSize: 11 },
  }

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 mb-4">

      {/* Header + tab switcher */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Stress trend</h2>
        <div className="flex bg-gray-800 rounded-lg p-0.5 gap-0.5">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                tab === t ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={150}>
        {isYear ? (
          <BarChart data={data} margin={{ left: -15, right: 5, top: 5, bottom: 0 }} barSize={18}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip {...tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <ReferenceLine y={50} stroke="#374151" strokeDasharray="3 3" />
            <Bar dataKey="score" radius={[3, 3, 0, 0]}>
              {data.map((d, i) => (
                <Cell key={i} fill={scoreColor(d.score)} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        ) : (
          <AreaChart data={data} margin={{ left: -15, right: 5, top: 5, bottom: 0 }}>
            <defs>
              <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip {...tooltipStyle} />
            <ReferenceLine y={50} stroke="#374151" strokeDasharray="3 3" />
            <Area
              type="monotone" dataKey="score"
              stroke="#a78bfa" strokeWidth={2}
              fill="url(#trendGrad)"
              dot={false}
              activeDot={{ r: 4, fill: '#c4b5fd', strokeWidth: 0 }}
            />
          </AreaChart>
        )}
      </ResponsiveContainer>

      <TrendStats data={data} />
    </div>
  )
}

// ─── Gauge ────────────────────────────────────────────────────────────────────
function Gauge({ score }) {
  const R = 80, cx = 100, cy = 100
  function polar(deg, r = R) {
    const rad = (deg * Math.PI) / 180
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)]
  }
  function arc(from, to, r = R) {
    const [x1, y1] = polar(from, r)
    const [x2, y2] = polar(to, r)
    return `M ${x1} ${y1} A ${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${x2} ${y2}`
  }
  const end = 210 + (score / 100) * 240
  const [nx, ny] = polar(end, R - 14)
  const color = scoreColor(score)
  return (
    <svg viewBox="0 0 200 160" className="w-52 h-40 mx-auto">
      <path d={arc(210, 450)} fill="none" stroke="#374151" strokeWidth="14" strokeLinecap="round" />
      <path d={arc(210, end)} fill="none" stroke={color} strokeWidth="14" strokeLinecap="round" />
      <circle cx={nx} cy={ny} r="5" fill={color} />
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="28" fontWeight="bold" fill="white">{score?.toFixed(1)}</text>
      <text x={cx} y={cy + 28} textAnchor="middle" fontSize="10" fill="#9ca3af">allostatic load</text>
    </svg>
  )
}

// ─── Sub-score card ───────────────────────────────────────────────────────────
const SUB_META = {
  financial:   { icon: '💸', label: 'Financial',   detail: '/detail/financial' },
  hrv_sleep:   { icon: '💓', label: 'HRV & Sleep', detail: '/detail/hrv' },
  behavioral:  { icon: '📱', label: 'Behavioral',  detail: '/detail/behavioral' },
  self_report: { icon: '🧠', label: 'Self-report', detail: '/detail/self-report' },
}

const WEIGHT_TO_PERM = {
  financial:   'financial',
  hrv_sleep:   'hrv',
  behavioral:  'behavioral',
  self_report: 'selfReport',
}

function SubScoreCard({ category, score, navigate, scoreState, permitted }) {
  const meta = SUB_META[category]
  const color = scoreColor(score)
  if (!permitted) {
    return (
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 opacity-50">
        <div className="flex items-center gap-2 mb-1">
          <span>{meta.icon}</span><span className="text-xs text-gray-400">{meta.label}</span>
        </div>
        <p className="text-xs text-gray-600">Not permitted</p>
      </div>
    )
  }
  return (
    <button
      onClick={() => navigate(meta.detail, { state: scoreState })}
      className="bg-gray-900 rounded-2xl border border-gray-800 p-4 text-left hover:border-gray-600 transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span>{meta.icon}</span><span className="text-xs text-gray-400">{meta.label}</span>
        </div>
        <span className="text-lg font-bold" style={{ color }}>{Math.round(score)}</span>
      </div>
      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
    </button>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
const DEMO_INPUTS = {
  hrv_sleep:   { rmssd_ms: 38, sleep_duration_hrs: 6.5, sleep_efficiency_pct: 78 },
  financial:   { monthly_income_usd: 2000, monthly_remittance_usd: 400, total_debt_usd: 5000, income_stability: 0.7 },
  behavioral:  { screen_time_hrs: 7, steps_per_day: 4500, exercise_mins_per_week: 60 },
  self_report: { stress_rating: 7, mood_rating: 4 },
}

function bandLabel(band) {
  return { low: 'Low', moderate: 'Moderate', high: 'High', severe: 'Severe' }[band] || '–'
}

export default function HomePage() {
  const navigate = useNavigate()
  const [scoreData, setScoreData] = useState(null)
  const [scoreState, setScoreState] = useState(null)
  const [trendBase, setTrendBase] = useState(null)
  const [loading, setLoading] = useState(true)
  const permissions = getPermissions()
  const weights = getWeights()

  useEffect(() => {
    const last = getLastScore()
    if (last) {
      setScoreData(last)
      setScoreState({ result: last, inputs: DEMO_INPUTS })
      setTrendBase(last.allostatic_load)
      setLoading(false)
    } else {
      const payload = weights ? { ...DEMO_INPUTS, weights } : DEMO_INPUTS
      axios.post('/api/score', payload)
        .then(res => {
          saveScoreToHistory(res.data)
          setScoreData(res.data)
          setScoreState({ result: res.data, inputs: DEMO_INPUTS })
          setTrendBase(res.data.allostatic_load)
        })
        .catch(() => {
          const fallback = {
            allostatic_load: 62.4, band: 'high', k6_equivalent: 'moderate-severe distress',
            sub_scores: { hrv_sleep: 55, financial: 70, behavioral: 45, self_report: 60 },
            dominant_stressor: 'financial', nudges: [],
          }
          setScoreData(fallback)
          setScoreState({ result: fallback, inputs: DEMO_INPUTS })
          setTrendBase(fallback.allostatic_load)
        })
        .finally(() => setLoading(false))
    }
  }, [])

  // Generate all three trend datasets once, when base score is known
  const weekData  = useMemo(() => trendBase ? syntheticWeek(trendBase)  : [], [trendBase])
  const monthData = useMemo(() => trendBase ? syntheticMonth(trendBase) : [], [trendBase])
  const yearData  = useMemo(() => trendBase ? syntheticYear(trendBase)  : [], [trendBase])

  const user = (() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER)) } catch { return null } })()
  const unpermittedCount = Object.values(permissions).filter(v => !v).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading your summary…</p>
      </div>
    )
  }

  const r = scoreData
  const bandColors = {
    low:      { bg: 'bg-green-900/30',  border: 'border-green-700',  text: 'text-green-400'  },
    moderate: { bg: 'bg-yellow-900/30', border: 'border-yellow-700', text: 'text-yellow-400' },
    high:     { bg: 'bg-orange-900/30', border: 'border-orange-700', text: 'text-orange-400' },
    severe:   { bg: 'bg-red-900/30',    border: 'border-red-700',    text: 'text-red-400'    },
  }
  const band = bandColors[r.band] || bandColors.moderate

  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4 pb-24">
      <div className="max-w-2xl mx-auto">

        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-white">{user ? 'Hello 👋' : 'MannChill'}</h1>
          <p className="text-gray-500 text-sm">Here's your stress summary</p>
        </div>

        {/* Main score card */}
        <div className={`rounded-2xl border p-6 mb-4 text-center ${band.bg} ${band.border}`}>
          <Gauge score={r.allostatic_load} />
          <div className={`inline-block mt-2 px-4 py-1 rounded-full text-sm font-semibold border ${band.bg} ${band.border} ${band.text}`}>
            {bandLabel(r.band)} — {r.k6_equivalent}
          </div>
          <p className="text-gray-400 text-xs mt-2">
            Primary stressor: <span className="text-white font-medium">{r.dominant_stressor?.replace('_', ' ')}</span>
          </p>
        </div>

        {/* Spectrum bar */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 mb-4">
          <p className="text-xs text-gray-500 mb-2">Stress spectrum</p>
          <div className="relative h-3 rounded-full overflow-hidden"
            style={{ background: 'linear-gradient(to right, #4ade80, #facc15, #fb923c, #f87171)' }}>
            <div className="absolute top-0 w-3 h-3 bg-white rounded-full shadow-lg"
              style={{ left: `calc(${r.allostatic_load}% - 6px)` }} />
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>Low</span><span>Moderate</span><span>High</span><span>Severe</span>
          </div>
        </div>

        {/* Multi-timeframe trend */}
        {trendBase && (
          <TrendCard weekData={weekData} monthData={monthData} yearData={yearData} />
        )}

        {/* Sub-score cards */}
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">Score breakdown</h2>
          <div className="grid grid-cols-2 gap-3">
            {Object.keys(SUB_META).map(cat => (
              <SubScoreCard
                key={cat}
                category={cat}
                score={r.sub_scores?.[cat] ?? 0}
                navigate={navigate}
                scoreState={scoreState}
                permitted={permissions[WEIGHT_TO_PERM[cat]] !== false}
              />
            ))}
          </div>
        </div>

        {/* Accuracy disclaimer */}
        {unpermittedCount > 0 && (
          <div className="bg-yellow-900/20 border border-yellow-800/40 rounded-2xl p-4 mb-4">
            <p className="text-xs text-yellow-300/80 leading-relaxed">
              <span className="font-semibold">Improve accuracy:</span> {unpermittedCount} data source{unpermittedCount > 1 ? 's are' : ' is'} not permitted.
              Enabling them gives the model more signal and increases score precision.{' '}
              <button onClick={() => navigate('/sources')} className="underline text-yellow-300">Manage permissions</button>
            </p>
          </div>
        )}

        {/* Top nudge */}
        {r.nudges?.length > 0 && (
          <div className="bg-gray-900 rounded-2xl border border-purple-900/50 p-5 mb-4">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">Top nudge</h2>
            <div className="flex items-start gap-3">
              <span className="text-xl">💡</span>
              <div>
                <p className="text-sm text-gray-200 leading-relaxed">{r.nudges[0].message_en}</p>
                {r.nudges[0].message_ne && (
                  <p className="text-xs text-gray-500 mt-1">{r.nudges[0].message_ne}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 mb-4">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">Quick actions</h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: '📊 Get new score',  path: '/intake' },
              { label: '🔮 Run what-if',    path: '/scenario' },
              { label: '🤝 View resources', path: `/resources/${r.band}` },
              { label: '✅ Weekly routine', path: '/routine' },
            ].map(({ label, path }) => (
              <button
                key={path}
                onClick={() => navigate(path, { state: scoreState })}
                className="py-2.5 px-3 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors text-sm text-left"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
