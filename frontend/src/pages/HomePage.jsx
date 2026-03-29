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

// ─── Stats row ────────────────────────────────────────────────────────────────
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
          style={{ background: '#faf5ff', border: '1px solid #f0e4ff' }}>
          <p className="text-xs mb-1" style={{ color: '#555555' }}>{label}</p>
          <p className="text-xl font-bold" style={{ color }}>{value}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Trend chart ─────────────────────────────────────────────────────────────
const TREND_TABS = ['1W', '1M', '1Y']

function TrendCard({ weekData, monthData, yearData }) {
  const [tab, setTab] = useState('1W')

  const data = tab === '1W' ? weekData : tab === '1M' ? monthData : yearData
  const isYear = tab === '1Y'

  const tooltipStyle = {
    contentStyle: { background: '#ffffff', border: '1px solid #f0e4ff', borderRadius: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' },
    labelStyle: { color: '#111111', fontSize: 11, fontWeight: 600 },
    itemStyle: { color: '#ff5f1f', fontSize: 11 },
  }

  return (
    <div className="bg-white rounded-2xl p-5 mb-4"
      style={{ boxShadow: '0 2px 16px rgba(140,60,200,0.08)', border: '1px solid #f0e4ff' }}>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#555555' }}>Stress trend</h2>
        <div className="flex rounded-xl p-0.5 gap-0.5" style={{ background: '#faf5ff' }}>
          {TREND_TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
              style={tab === t
                ? { background: 'linear-gradient(135deg, #ff5f1f, #e040fb)', color: 'white' }
                : { color: '#555555' }
              }
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={150}>
        {isYear ? (
          <BarChart data={data} margin={{ left: -15, right: 5, top: 5, bottom: 0 }} barSize={18}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0e4ff" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: '#b09ac0', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: '#b09ac0', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip {...tooltipStyle} cursor={{ fill: 'rgba(224,64,251,0.05)' }} />
            <ReferenceLine y={50} stroke="#f0e4ff" strokeDasharray="3 3" />
            <Bar dataKey="score" radius={[4, 4, 0, 0]}>
              {data.map((d, i) => (
                <Cell key={i} fill={scoreColor(d.score)} fillOpacity={0.9} />
              ))}
            </Bar>
          </BarChart>
        ) : (
          <AreaChart data={data} margin={{ left: -15, right: 5, top: 5, bottom: 0 }}>
            <defs>
              <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff5f1f" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#e040fb" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0e4ff" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: '#b09ac0', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: '#b09ac0', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip {...tooltipStyle} />
            <ReferenceLine y={50} stroke="#f0e4ff" strokeDasharray="3 3" />
            <Area
              type="monotone" dataKey="score"
              stroke="#ff5f1f" strokeWidth={2.5}
              fill="url(#trendGrad)"
              dot={false}
              activeDot={{ r: 4, fill: '#ff5f1f', strokeWidth: 0 }}
            />
          </AreaChart>
        )}
      </ResponsiveContainer>

      <TrendStats data={data} />
      <p className="text-center text-xs mt-2" style={{ color: '#b09ac0' }}>
        Projected trend · updates with each new score
      </p>
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
      <path d={arc(210, 450)} fill="none" stroke="#f0e4ff" strokeWidth="14" strokeLinecap="round" />
      <path d={arc(210, end)} fill="none" stroke={color} strokeWidth="14" strokeLinecap="round" />
      <circle cx={nx} cy={ny} r="5" fill={color} />
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="28" fontWeight="bold" fill="#1e0a2e">{score?.toFixed(1)}</text>
      <text x={cx} y={cy + 28} textAnchor="middle" fontSize="10" fill="#9d7ab5">allostatic load</text>
    </svg>
  )
}

// ─── Sub-score card ───────────────────────────────────────────────────────────
const SUB_META = {
  financial:   { icon: '💸', label: 'Financial',   detail: '/detail/financial', bg: '#fff4ec', accent: '#ff5f1f' },
  hrv_sleep:   { icon: '💓', label: 'HRV & Sleep', detail: '/detail/hrv',       bg: '#fdf0ff', accent: '#e040fb' },
  behavioral:  { icon: '📱', label: 'Behavioral',  detail: '/detail/behavioral', bg: '#f0fdf4', accent: '#16a34a' },
  self_report: { icon: '🧠', label: 'Self-report', detail: '/detail/self-report', bg: '#fffbeb', accent: '#d97706' },
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
        style={{ background: '#faf5ff', border: '1px solid #f0e4ff' }}>
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
      style={{ background: meta.bg, border: `1.5px solid ${meta.accent}30` }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 4px 16px ${meta.accent}25` }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none' }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span>{meta.icon}</span>
          <span className="text-xs font-medium" style={{ color: '#111111' }}>{meta.label}</span>
        </div>
        <span className="text-lg font-bold" style={{ color }}>{Math.round(score)}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: `${meta.accent}20` }}>
        <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
    </button>
  )
}

// ─── Profile dropdown ─────────────────────────────────────────────────────────
function ProfileDropdown({ user, onClose, navigate }) {
  function clearAndRedirect() {
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k))
    navigate('/', { replace: true })
  }

  function handleDeleteAccount() {
    if (window.confirm('Delete your account? All local data will be removed.')) {
      clearAndRedirect()
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-10 z-50 w-64 bg-white rounded-2xl overflow-hidden"
        style={{ border: '1px solid #f0e4ff', boxShadow: '0 8px 32px rgba(140,60,200,0.18)' }}>

        <div className="px-4 py-4" style={{ borderBottom: '1px solid #f0e4ff' }}>
          <p className="text-sm font-bold truncate" style={{ color: '#111111' }}>{user?.contact || 'User'}</p>
          {user?.birthYear && (
            <p className="text-xs mt-0.5" style={{ color: '#555555' }}>
              Born {user.birthMonth ? `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][user.birthMonth-1]} ` : ''}{user.birthYear}
            </p>
          )}
        </div>

        <div className="py-2">
          {[
            { icon: '🔒', label: 'Manage permissions', action: () => { onClose(); navigate('/permissions') } },
            { icon: '📡', label: 'Data sources',        action: () => { onClose(); navigate('/sources') } },
          ].map(({ icon, label, action }) => (
            <button key={label} onClick={action}
              className="w-full px-4 py-3 text-left text-sm flex items-center gap-3 transition-colors hover:bg-plum-50"
              style={{ color: '#111111' }}
            >
              <span>{icon}</span> {label}
            </button>
          ))}
          <div style={{ borderTop: '1px solid #f0e4ff', margin: '4px 0' }} />
          <button onClick={clearAndRedirect}
            className="w-full px-4 py-3 text-left text-sm flex items-center gap-3 transition-colors hover:bg-plum-50"
            style={{ color: '#111111' }}
          >
            <span>🚪</span> Sign out
          </button>
          <button onClick={handleDeleteAccount}
            className="w-full px-4 py-3 text-left text-sm flex items-center gap-3 transition-colors"
            style={{ color: '#e11d48' }}
            onMouseEnter={e => e.currentTarget.style.background = '#fff0f3'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span>🗑️</span> Delete account
          </button>
        </div>
      </div>
    </>
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

const BAND_STYLES = {
  low:      { bg: '#f0fdf4', border: '#86efac', text: '#16a34a' },
  moderate: { bg: '#fffbeb', border: '#fde68a', text: '#d97706' },
  high:     { bg: '#fff4ec', border: '#fdba74', text: '#ea580c' },
  severe:   { bg: '#fff0f3', border: '#fca5a5', text: '#dc2626' },
}

export default function HomePage() {
  const navigate = useNavigate()
  const [scoreData, setScoreData] = useState(null)
  const [scoreState, setScoreState] = useState(null)
  const [trendBase, setTrendBase] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showProfile, setShowProfile] = useState(false)
  const permissions = getPermissions()
  const weights = getWeights()

  useEffect(() => {
    // Merge real WHOOP data if connected
    const whoopRaw = localStorage.getItem('whoop_data')
    const whoopData = whoopRaw ? JSON.parse(whoopRaw) : null
    const inputs = whoopData
      ? {
          ...DEMO_INPUTS,
          hrv_sleep: { rmssd_ms: whoopData.rmssd_ms, sleep_duration_hrs: whoopData.sleep_duration_hrs, sleep_efficiency_pct: whoopData.sleep_efficiency_pct },
          ...(whoopData.exercise_mins_week != null && {
            behavioral: { ...DEMO_INPUTS.behavioral, exercise_mins_per_week: whoopData.exercise_mins_week }
          }),
        }
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
            allostatic_load: 62.4, band: 'high', stress_level: 'high stress',
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

  // Persist trend data so it stays stable across page loads
  const weekData  = useMemo(() => {
    if (!trendBase) return []
    const key = 'mannchill_trend_week'
    const stored = localStorage.getItem(key)
    if (stored) { try { const d = JSON.parse(stored); if (d.base === Math.round(trendBase)) return d.data } catch {} }
    const data = syntheticWeek(trendBase)
    localStorage.setItem(key, JSON.stringify({ base: Math.round(trendBase), data }))
    return data
  }, [trendBase])
  const monthData = useMemo(() => {
    if (!trendBase) return []
    const key = 'mannchill_trend_month'
    const stored = localStorage.getItem(key)
    if (stored) { try { const d = JSON.parse(stored); if (d.base === Math.round(trendBase)) return d.data } catch {} }
    const data = syntheticMonth(trendBase)
    localStorage.setItem(key, JSON.stringify({ base: Math.round(trendBase), data }))
    return data
  }, [trendBase])
  const yearData  = useMemo(() => {
    if (!trendBase) return []
    const key = 'mannchill_trend_year'
    const stored = localStorage.getItem(key)
    if (stored) { try { const d = JSON.parse(stored); if (d.base === Math.round(trendBase)) return d.data } catch {} }
    const data = syntheticYear(trendBase)
    localStorage.setItem(key, JSON.stringify({ base: Math.round(trendBase), data }))
    return data
  }, [trendBase])

  const user = (() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER)) } catch { return null } })()
  const unpermittedCount = Object.values(permissions).filter(v => !v).length

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <p className="text-sm" style={{ color: '#555555' }}>Loading your summary…</p>
      </div>
    )
  }

  const r = scoreData
  const band = BAND_STYLES[r.band] || BAND_STYLES.moderate

  return (
    <div className="min-h-screen bg-cream-100 py-8 px-4 pb-24">
      <div className="max-w-2xl mx-auto">

        {/* Greeting + profile */}
        <div className="flex items-center justify-between mb-6 relative">
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#111111' }}>
              {user ? `Hello, ${user.contact?.split('@')[0] || user.contact} 👋` : 'MannChill 🧘'}
            </h1>
            <p className="text-sm" style={{ color: '#555555' }}>Here's your stress summary</p>
          </div>
          <button
            onClick={() => setShowProfile(p => !p)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold transition-all"
            style={{ background: 'linear-gradient(135deg, #ff5f1f, #e040fb)', boxShadow: '0 4px 12px rgba(255,95,31,0.35)' }}
          >
            {user?.contact?.[0]?.toUpperCase() || '👤'}
          </button>
          {showProfile && (
            <ProfileDropdown user={user} onClose={() => setShowProfile(false)} navigate={navigate} />
          )}
        </div>

        {/* Main score card */}
        <div className="rounded-2xl p-6 mb-4 text-center"
          style={{ background: band.bg, border: `1.5px solid ${band.border}`, boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
          <Gauge score={r.allostatic_load} />
          <div className="inline-block mt-2 px-4 py-1.5 rounded-full text-sm font-bold"
            style={{ background: '#ffffff', color: band.text, border: `1.5px solid ${band.border}` }}>
            {bandLabel(r.band)} — {r.stress_level}
          </div>
          <p className="text-xs mt-2" style={{ color: '#555555' }}>
            Primary stressor: <span className="font-semibold" style={{ color: '#111111' }}>{r.dominant_stressor?.replace('_', ' ')}</span>
          </p>
        </div>

        {/* Spectrum bar */}
        <div className="bg-white rounded-2xl p-4 mb-4"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #f0e4ff' }}>
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

        {/* Multi-timeframe trend */}
        {trendBase && (
          <TrendCard weekData={weekData} monthData={monthData} yearData={yearData} />
        )}

        {/* Sub-score cards */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#555555' }}>Score breakdown</h2>
            {localStorage.getItem('whoop_connected') === 'true' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                ⌚ WHOOP live
              </span>
            )}
          </div>
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
          <div className="rounded-2xl p-4 mb-4"
            style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
            <p className="text-xs leading-relaxed" style={{ color: '#92400e' }}>
              <span className="font-semibold">Improve accuracy:</span> {unpermittedCount} data source{unpermittedCount > 1 ? 's are' : ' is'} not permitted.
              Enabling them gives the model more signal.{' '}
              <button onClick={() => navigate('/sources')} className="underline font-semibold" style={{ color: '#d97706' }}>
                Manage permissions
              </button>
            </p>
          </div>
        )}

        {/* Top nudge */}
        {r.nudges?.length > 0 && (
          <div className="bg-white rounded-2xl p-5 mb-4"
            style={{ border: '1.5px solid #fdd0b0', boxShadow: '0 2px 16px rgba(255,95,31,0.1)' }}>
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: '#ff5f1f' }}>Top nudge 💡</h2>
            <div className="flex items-start gap-3">
              <div>
                <p className="text-sm leading-relaxed" style={{ color: '#111111' }}>{r.nudges[0].message_en}</p>
                {r.nudges[0].message_ne && (
                  <p className="text-xs mt-1" style={{ color: '#555555' }}>{r.nudges[0].message_ne}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="bg-white rounded-2xl p-5 mb-4"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f0e4ff' }}>
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: '#555555' }}>Quick actions</h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: '📊 Get new score',  path: '/intake',                  bg: '#fff4ec', color: '#ff5f1f' },
              { label: '📡 Data sources',   path: '/sources',                 bg: '#f0f0ff', color: '#6366f1' },
              { label: '🔮 Run what-if',    path: '/scenario',                bg: '#fdf0ff', color: '#9333ea' },
              { label: '🤝 View resources', path: `/resources/${r.band}`,     bg: '#f0fdf4', color: '#16a34a' },
              { label: '✅ Weekly routine', path: '/routine',                  bg: '#fffbeb', color: '#d97706' },
              { label: '📚 Research base', path: '/research',                bg: '#f5f3ff', color: '#7c3aed' },
            ].map(({ label, path, bg, color }) => (
              <button
                key={path}
                onClick={() => navigate(path, { state: scoreState })}
                className="py-3 px-3 rounded-xl text-sm text-left font-medium transition-all"
                style={{ background: bg, color }}
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
