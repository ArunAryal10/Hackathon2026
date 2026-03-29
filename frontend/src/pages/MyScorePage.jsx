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
        <div key={label} className="rounded-xl p-3 text-center"
          style={{ background: '#f5f5f5', border: '1px solid #e5e5e5' }}>
          <p className="text-xs mb-1" style={{ color: '#555555' }}>{label}</p>
          <p className="text-xl font-bold" style={{ color }}>{value}</p>
        </div>
      ))}
    </div>
  )
}

const TREND_TABS = ['1W', '1M', '1Y']

function TrendCard({ weekData, monthData, yearData }) {
  const [tab, setTab] = useState('1W')
  const data = tab === '1W' ? weekData : tab === '1M' ? monthData : yearData
  const isYear = tab === '1Y'

  const tooltipStyle = {
    contentStyle: { background: '#ffffff', border: '1px solid #e5e5e5', borderRadius: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' },
    labelStyle: { color: '#111111', fontSize: 11, fontWeight: 600 },
    itemStyle: { color: '#111111', fontSize: 11 },
  }

  return (
    <div className="bg-white rounded-2xl p-5 mb-4"
      style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)', border: '1px solid #e5e5e5' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#555555' }}>Stress trend</h2>
        <div className="flex rounded-xl p-0.5 gap-0.5" style={{ background: '#f5f5f5' }}>
          {TREND_TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
              style={tab === t
                ? { background: '#111111', color: 'white' }
                : { color: '#555555' }
              }
            >{t}</button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={150}>
        {isYear ? (
          <BarChart data={data} margin={{ left: -15, right: 5, top: 5, bottom: 0 }} barSize={18}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: '#aaaaaa', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: '#aaaaaa', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip {...tooltipStyle} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
            <ReferenceLine y={50} stroke="#e5e5e5" strokeDasharray="3 3" />
            <Bar dataKey="score" radius={[4, 4, 0, 0]}>
              {data.map((d, i) => <Cell key={i} fill={scoreColor(d.score)} fillOpacity={0.9} />)}
            </Bar>
          </BarChart>
        ) : (
          <AreaChart data={data} margin={{ left: -15, right: 5, top: 5, bottom: 0 }}>
            <defs>
              <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#111111" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#111111" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: '#aaaaaa', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: '#aaaaaa', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip {...tooltipStyle} />
            <ReferenceLine y={50} stroke="#e5e5e5" strokeDasharray="3 3" />
            <Area type="monotone" dataKey="score" stroke="#111111" strokeWidth={2.5}
              fill="url(#trendGrad)" dot={false}
              activeDot={{ r: 4, fill: '#111111', strokeWidth: 0 }} />
          </AreaChart>
        )}
      </ResponsiveContainer>
      <TrendStats data={data} />
    </div>
  )
}

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
      <path d={arc(210, 450)} fill="none" stroke="#e5e5e5" strokeWidth="14" strokeLinecap="round" />
      <path d={arc(210, end)} fill="none" stroke={color} strokeWidth="14" strokeLinecap="round" />
      <circle cx={nx} cy={ny} r="5" fill={color} />
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="28" fontWeight="bold" fill="#111111">{score?.toFixed(1)}</text>
      <text x={cx} y={cy + 28} textAnchor="middle" fontSize="10" fill="#888888">allostatic load</text>
    </svg>
  )
}

const SUB_META = {
  financial:   { icon: '💸', label: 'Financial',   detail: '/detail/financial', bg: '#ffffff', accent: '#111111' },
  hrv_sleep:   { icon: '💓', label: 'HRV & Sleep', detail: '/detail/hrv',       bg: '#ffffff', accent: '#111111' },
  behavioral:  { icon: '📱', label: 'Behavioral',  detail: '/detail/behavioral', bg: '#ffffff', accent: '#111111' },
  self_report: { icon: '🧠', label: 'Self-report', detail: '/detail/self-report', bg: '#ffffff', accent: '#111111' },
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
      <div className="rounded-2xl p-4 opacity-40"
        style={{ background: '#f5f5f5', border: '1px solid #e5e5e5' }}>
        <div className="flex items-center gap-2 mb-1">
          <span>{meta.icon}</span>
          <span className="text-xs" style={{ color: '#555555' }}>{meta.label}</span>
        </div>
        <p className="text-xs" style={{ color: '#888888' }}>Not permitted</p>
      </div>
    )
  }
  return (
    <button
      onClick={() => navigate(meta.detail, { state: scoreState })}
      className="rounded-2xl p-4 text-left transition-all"
      style={{ background: meta.bg, border: '1.5px solid #e5e5e5' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none' }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span>{meta.icon}</span>
          <span className="text-xs font-medium" style={{ color: '#111111' }}>{meta.label}</span>
        </div>
        <span className="text-lg font-bold" style={{ color }}>{Math.round(score)}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#e5e5e5' }}>
        <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
    </button>
  )
}

const DEMO_INPUTS = {
  hrv_sleep:   { rmssd_ms: 38, sleep_duration_hrs: 6.5, sleep_efficiency_pct: 78 },
  financial:   { monthly_income_usd: 2000, monthly_remittance_usd: 400, total_debt_usd: 5000, income_stability: 0.7 },
  behavioral:  { screen_time_hrs: 7, steps_per_day: 4500, exercise_mins_per_week: 60 },
  self_report: { stress_rating: 7, mood_rating: 4 },
}

function bandLabel(band) {
  return { low: 'Low', moderate: 'Moderate', high: 'High', severe: 'Severe' }[band] || '–'
}

const BAND_STYLES = {
  low:      { bg: '#f0fdf4', border: '#86efac', text: '#16a34a' },
  moderate: { bg: '#fffbeb', border: '#fde68a', text: '#d97706' },
  high:     { bg: '#fff4ec', border: '#fdba74', text: '#ea580c' },
  severe:   { bg: '#fff0f3', border: '#fca5a5', text: '#dc2626' },
}

export default function MyScorePage() {
  const navigate = useNavigate()
  const [scoreData, setScoreData] = useState(null)
  const [scoreState, setScoreState] = useState(null)
  const [trendBase, setTrendBase] = useState(null)
  const [loading, setLoading] = useState(true)
  const permissions = getPermissions()
  const weights = getWeights()

  useEffect(() => {
    const whoopRaw = localStorage.getItem('whoop_data')
    const whoopData = whoopRaw ? JSON.parse(whoopRaw) : null
    const inputs = whoopData
      ? { ...DEMO_INPUTS, hrv_sleep: { rmssd_ms: whoopData.rmssd_ms, sleep_duration_hrs: whoopData.sleep_duration_hrs, sleep_efficiency_pct: whoopData.sleep_efficiency_pct } }
      : DEMO_INPUTS

    const last = getLastScore()
    if (last && !whoopData) {
      setScoreData(last)
      setScoreState({ result: last, inputs })
      setTrendBase(last.allostatic_load)
      setLoading(false)
    } else {
      const payload = weights ? { ...inputs, weights } : inputs
      axios.post('/api/score', payload)
        .then(res => {
          saveScoreToHistory(res.data)
          setScoreData(res.data)
          setScoreState({ result: res.data, inputs })
          setTrendBase(res.data.allostatic_load)
        })
        .catch(() => {
          const fallback = {
            allostatic_load: 62.4, band: 'high', k6_equivalent: 'moderate-severe distress',
            sub_scores: { hrv_sleep: 55, financial: 70, behavioral: 45, self_report: 60 },
            dominant_stressor: 'financial', nudges: [],
          }
          setScoreData(fallback)
          setScoreState({ result: fallback, inputs })
          setTrendBase(fallback.allostatic_load)
        })
        .finally(() => setLoading(false))
    }
  }, [])

  const weekData  = useMemo(() => trendBase ? syntheticWeek(trendBase)  : [], [trendBase])
  const monthData = useMemo(() => trendBase ? syntheticMonth(trendBase) : [], [trendBase])
  const yearData  = useMemo(() => trendBase ? syntheticYear(trendBase)  : [], [trendBase])

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <p className="text-sm" style={{ color: '#555555' }}>Loading your score…</p>
      </div>
    )
  }

  const r = scoreData
  const band = BAND_STYLES[r.band] || BAND_STYLES.moderate

  return (
    <div className="min-h-screen bg-cream-100 py-8 px-4 pb-24">
      <div className="max-w-2xl mx-auto">

        <div className="mb-6">
          <h1 className="text-xl font-bold" style={{ color: '#111111' }}>My Score</h1>
          <p className="text-sm" style={{ color: '#555555' }}>Your allostatic load breakdown</p>
        </div>

        {/* Main score card */}
        <div className="rounded-2xl p-6 mb-4 text-center"
          style={{ background: band.bg, border: `1.5px solid ${band.border}`, boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
          <Gauge score={r.allostatic_load} />
          <div className="inline-block mt-2 px-4 py-1.5 rounded-full text-sm font-bold"
            style={{ background: '#ffffff', color: band.text, border: `1.5px solid ${band.border}` }}>
            {bandLabel(r.band)} — {r.k6_equivalent}
          </div>
          <p className="text-xs mt-2" style={{ color: '#555555' }}>
            Primary stressor: <span className="font-semibold" style={{ color: '#111111' }}>{r.dominant_stressor?.replace('_', ' ')}</span>
          </p>
        </div>

        {/* Spectrum bar */}
        <div className="bg-white rounded-2xl p-4 mb-4"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #e5e5e5' }}>
          <p className="text-xs mb-2 font-medium" style={{ color: '#555555' }}>Stress spectrum</p>
          <div className="relative h-4 rounded-full overflow-hidden"
            style={{ background: 'linear-gradient(to right, #4ade80, #facc15, #fb923c, #f87171)' }}>
            <div className="absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-md"
              style={{ left: `calc(${r.allostatic_load}% - 6px)`, boxShadow: '0 0 6px rgba(0,0,0,0.3)' }} />
          </div>
          <div className="flex justify-between text-xs mt-1.5" style={{ color: '#888888' }}>
            <span>Low</span><span>Moderate</span><span>High</span><span>Severe</span>
          </div>
        </div>

        {/* Trend chart */}
        {trendBase && (
          <TrendCard weekData={weekData} monthData={monthData} yearData={yearData} />
        )}

        {/* Sub-score cards */}
        <div className="mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: '#555555' }}>Score breakdown</h2>
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

        {/* Recalculate */}
        <button
          onClick={() => navigate('/intake')}
          className="btn-fruity w-full py-4 rounded-2xl font-bold text-base mb-4"
        >
          Recalculate score →
        </button>

      </div>
    </div>
  )
}
