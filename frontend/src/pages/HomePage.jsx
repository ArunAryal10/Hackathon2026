import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  getLastScore, getPermissions, getWeights,
  saveScoreToHistory, STORAGE_KEYS,
} from '../utils/permissions'

const ROUTINE_STORAGE_KEY = 'mannchill_routine'

const ALL_TASKS = [
  { id: 'sleep_1', text: 'In bed by 10:30pm at least 4 nights this week', emoji: '💓' },
  { id: 'sleep_2', text: 'No screens 30 minutes before bed', emoji: '💓' },
  { id: 'sleep_3', text: 'Check HRV on wearable — note if below 30ms', emoji: '💓' },
  { id: 'move_1', text: '8,000+ steps today', emoji: '🏃' },
  { id: 'move_2', text: '20-minute walk after dinner', emoji: '🏃' },
  { id: 'move_3', text: '30 minutes of intentional exercise this week', emoji: '🏃' },
  { id: 'fin_1', text: "Calculate this month's remittance as % of income", emoji: '💸' },
  { id: 'fin_2', text: "Review last 3 bank transactions for unnecessary spend", emoji: '💸' },
  { id: 'fin_3', text: 'Set aside emergency fund contribution (even $10)', emoji: '💸' },
  { id: 'mind_1', text: '10 minutes of mindfulness or quiet breathing', emoji: '🧘' },
  { id: 'mind_2', text: '5-minute journal: one thing stressing you + one thing in your control', emoji: '🧘' },
  { id: 'mind_3', text: 'Reach out to one friend or family member', emoji: '🧘' },
  { id: 'screen_1', text: 'Phone-free meals today', emoji: '📵' },
  { id: 'screen_2', text: 'Keep social media under 1.5h/day (3 days)', emoji: '📵' },
  { id: 'screen_3', text: 'First 15 minutes of morning: no phone', emoji: '📵' },
]

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

const DEMO_INPUTS = {
  hrv_sleep:   { rmssd_ms: 38, sleep_duration_hrs: 6.5, sleep_efficiency_pct: 78 },
  financial:   { monthly_income_usd: 2000, monthly_remittance_usd: 400, total_debt_usd: 5000, income_stability: 0.7 },
  behavioral:  { screen_time_hrs: 7, steps_per_day: 4500, exercise_mins_per_week: 60 },
  self_report: { stress_rating: 7, mood_rating: 4 },
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
        style={{ border: '1px solid #e5e5e5', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>

        <div className="px-4 py-4" style={{ borderBottom: '1px solid #e5e5e5' }}>
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
          <div style={{ borderTop: '1px solid #e5e5e5', margin: '4px 0' }} />
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

export default function HomePage() {
  const navigate = useNavigate()
  const [showProfile, setShowProfile] = useState(false)
  const [nudge, setNudge] = useState(null)
  const [checked, setChecked] = useState(() => {
    try { return JSON.parse(localStorage.getItem(ROUTINE_STORAGE_KEY)) || {} }
    catch { return {} }
  })

  const weights = getWeights()

  useEffect(() => {
    const last = getLastScore()
    const topNudge = last?.nudges?.[0] || null
    if (topNudge) { setNudge(topNudge); return }

    const whoopRaw = localStorage.getItem('whoop_data')
    const whoopData = whoopRaw ? JSON.parse(whoopRaw) : null
    const inputs = whoopData
      ? { ...DEMO_INPUTS, hrv_sleep: { rmssd_ms: whoopData.rmssd_ms, sleep_duration_hrs: whoopData.sleep_duration_hrs, sleep_efficiency_pct: whoopData.sleep_efficiency_pct } }
      : DEMO_INPUTS
    const payload = weights ? { ...inputs, weights } : inputs
    axios.post('/api/score', payload)
      .then(res => {
        saveScoreToHistory(res.data)
        setNudge(res.data.nudges?.[0] || null)
      })
      .catch(() => {})
  }, [])

  const user = (() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER)) } catch { return null } })()
  const firstName = user?.contact?.split('@')[0] || user?.contact || 'there'

  const total = ALL_TASKS.length
  const done = ALL_TASKS.filter(t => checked[t.id]).length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  const remaining = ALL_TASKS.filter(t => !checked[t.id]).slice(0, 3)

  function toggleTask(id) {
    const next = { ...checked, [id]: !checked[id] }
    setChecked(next)
    localStorage.setItem(ROUTINE_STORAGE_KEY, JSON.stringify(next))
  }

  return (
    <div className="min-h-screen bg-cream-100 py-8 px-4 pb-24">
      <div className="max-w-2xl mx-auto">

        {/* Greeting + profile */}
        <div className="flex items-center justify-between mb-6 relative">
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#111111' }}>
              {getGreeting()}, {firstName}
            </h1>
            <p className="text-sm" style={{ color: '#555555' }}>Every step forward counts.</p>
          </div>
          <button
            onClick={() => setShowProfile(p => !p)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold transition-all"
            style={{ background: '#111111', boxShadow: 'none' }}
          >
            {user?.contact?.[0]?.toUpperCase() || '?'}
          </button>
          {showProfile && (
            <ProfileDropdown user={user} onClose={() => setShowProfile(false)} navigate={navigate} />
          )}
        </div>

        {/* Weekly progress card */}
        <div className="bg-white rounded-2xl p-5 mb-4"
          style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)', border: '1px solid #e5e5e5' }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold" style={{ color: '#111111' }}>This week's progress</h2>
              <p className="text-xs mt-0.5" style={{ color: '#555555' }}>{done} of {total} challenges complete</p>
            </div>
            <div className="text-2xl font-extrabold" style={{ color: '#111111' }}>
              {pct}%
            </div>
          </div>
          <div className="h-3 rounded-full overflow-hidden mb-1" style={{ background: '#e5e5e5' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                background: '#111111',
              }}
            />
          </div>
          {done === total && total > 0 ? (
            <p className="text-xs font-semibold mt-2" style={{ color: '#16a34a' }}>Amazing — all challenges done this week!</p>
          ) : (
            <p className="text-xs mt-1" style={{ color: '#888888' }}>{total - done} left to go</p>
          )}
        </div>

        {/* What's left this week */}
        {remaining.length > 0 && (
          <div className="bg-white rounded-2xl p-5 mb-4"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #e5e5e5' }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold" style={{ color: '#111111' }}>Up next this week</h2>
              <button onClick={() => navigate('/routine')}
                className="text-xs font-semibold underline" style={{ color: '#111111' }}>
                See all
              </button>
            </div>
            <div className="space-y-3">
              {remaining.map(task => (
                <label key={task.id} className="flex items-start gap-3 cursor-pointer">
                  <div
                    className="mt-0.5 w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all"
                    style={{
                      background: checked[task.id] ? '#111111' : '#ffffff',
                      border: checked[task.id] ? 'none' : '1.5px solid #cccccc',
                    }}
                    onClick={() => toggleTask(task.id)}
                  >
                    {checked[task.id] && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span
                    className="text-sm leading-relaxed"
                    style={{ color: checked[task.id] ? '#aaaaaa' : '#111111', textDecoration: checked[task.id] ? 'line-through' : 'none' }}
                    onClick={() => toggleTask(task.id)}
                  >
                    <span className="mr-1">{task.emoji}</span>{task.text}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Top nudge */}
        {nudge && (
          <div className="bg-white rounded-2xl p-5 mb-4"
            style={{ border: '1px solid #e5e5e5', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: '#111111' }}>Today's nudge</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#111111' }}>{nudge.message_en}</p>
            {nudge.message_ne && (
              <p className="text-xs mt-1" style={{ color: '#555555' }}>{nudge.message_ne}</p>
            )}
          </div>
        )}

        {/* Quick actions */}
        <div className="bg-white rounded-2xl p-5 mb-4"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #e5e5e5' }}>
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: '#555555' }}>Quick actions</h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: '📊 My score',      path: '/score' },
              { label: '🔮 Run what-if',   path: '/scenario' },
              { label: '🤝 Resources',     path: '/resources/moderate' },
              { label: '✅ Full routine',  path: '/routine' },
            ].map(({ label, path }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="py-3 px-3 rounded-xl text-sm text-left font-medium transition-all"
                style={{ background: '#f5f5f5', color: '#111111' }}
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
