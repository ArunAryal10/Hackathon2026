import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const STORAGE_KEY = 'mannchill_routine'

const ACTIONS = [
  {
    category: 'Sleep & HRV',
    emoji: '💓',
    items: [
      { id: 'sleep_1', text: 'In bed by 10:30pm at least 4 nights this week' },
      { id: 'sleep_2', text: 'No screens 30 minutes before bed' },
      { id: 'sleep_3', text: 'Check HRV on wearable — note if below 30ms' },
    ],
  },
  {
    category: 'Movement',
    emoji: '🏃',
    items: [
      { id: 'move_1', text: '8,000+ steps today' },
      { id: 'move_2', text: '20-minute walk after dinner' },
      { id: 'move_3', text: '30 minutes of intentional exercise this week' },
    ],
  },
  {
    category: 'Financial',
    emoji: '💸',
    items: [
      { id: 'fin_1', text: "Calculate this month's remittance as % of income" },
      { id: 'fin_2', text: "Review last 3 bank transactions for unnecessary spend" },
      { id: 'fin_3', text: 'Set aside emergency fund contribution (even $10)' },
    ],
  },
  {
    category: 'Mind',
    emoji: '🧘',
    items: [
      { id: 'mind_1', text: '10 minutes of mindfulness or quiet breathing' },
      { id: 'mind_2', text: '5-minute journal: one thing stressing you + one thing in your control' },
      { id: 'mind_3', text: 'Reach out to one friend or family member' },
    ],
  },
  {
    category: 'Screen time',
    emoji: '📵',
    items: [
      { id: 'screen_1', text: 'Phone-free meals today' },
      { id: 'screen_2', text: 'Keep social media under 1.5h/day (3 days)' },
      { id: 'screen_3', text: 'First 15 minutes of morning: no phone' },
    ],
  },
]

export default function RoutinePage() {
  const navigate = useNavigate()
  const [checked, setChecked] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {} }
    catch { return {} }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checked))
  }, [checked])

  function toggle(id) {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }))
  }

  function clearAll() {
    setChecked({})
  }

  const total = ACTIONS.flatMap(a => a.items).length
  const done = Object.values(checked).filter(Boolean).length

  return (
    <div className="min-h-screen bg-cream-100 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        <div className="text-center mb-8">
          <div className="text-3xl mb-2">✅</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Weekly Routine</h1>
          <p className="text-gray-700 text-xs">Check off actions as you go — saved in your browser</p>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-700">This week's progress</span>
            <span className="text-sm font-semibold text-gray-900">{done}/{total}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-purple-500 transition-all duration-300"
              style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }}
            />
          </div>
          {done === total && total > 0 && (
            <p className="text-xs text-green-400 mt-2">All done — great week!</p>
          )}
        </div>

        {/* Action categories */}
        {ACTIONS.map(cat => (
          <div key={cat.category} className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">
              <span className="mr-2">{cat.emoji}</span>{cat.category}
            </h2>
            <div className="space-y-3">
              {cat.items.map(item => (
                <label key={item.id} className="flex items-start gap-3 cursor-pointer group">
                  <div className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border transition-colors ${
                    checked[item.id]
                      ? 'bg-brand-500 border-purple-600'
                      : 'border-gray-300 group-hover:border-purple-500'
                  }`}
                    onClick={() => toggle(item.id)}
                  >
                    {checked[item.id] && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`text-sm leading-relaxed transition-colors ${checked[item.id] ? 'text-gray-400 line-through' : 'text-gray-900'}`}
                    onClick={() => toggle(item.id)}
                  >
                    {item.text}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <button
          onClick={clearAll}
          className="w-full py-3 rounded-xl border border-gray-200 text-gray-700 hover:text-gray-300 hover:bg-white transition-colors text-sm mb-3"
        >
          Reset for new week
        </button>

        <button onClick={() => navigate(-1)} className="w-full py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-white transition-colors text-sm">
          ← Back
        </button>

      </div>
    </div>
  )
}
