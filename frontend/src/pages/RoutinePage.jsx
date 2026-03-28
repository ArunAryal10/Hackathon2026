import { useState } from 'react'

const WEEKLY_ROUTINE = [
  {
    category: 'Financial',
    emoji: '💸',
    tasks: [
      { id: 'f1', label: 'Calculate this month\'s remittance as % of income' },
      { id: 'f2', label: 'Review last 3 bank transactions for unnecessary spend' },
      { id: 'f3', label: 'Set aside emergency fund contribution (even $10)' },
    ],
  },
  {
    category: 'Sleep & HRV',
    emoji: '💓',
    tasks: [
      { id: 'h1', label: 'Sleep before midnight 5 out of 7 nights' },
      { id: 'h2', label: 'No phone 30 min before bed (3 nights this week)' },
      { id: 'h3', label: 'Check HRV on wearable — note if below 30ms' },
    ],
  },
  {
    category: 'Movement',
    emoji: '🏃',
    tasks: [
      { id: 'b1', label: '10-minute walk after lunch (5 days)' },
      { id: 'b2', label: '30-minute workout or yoga session (2x this week)' },
      { id: 'b3', label: 'Hit 6,000 steps at least 4 days' },
    ],
  },
  {
    category: 'Screen time',
    emoji: '📱',
    tasks: [
      { id: 's1', label: 'Check screen time in phone settings' },
      { id: 's2', label: 'Keep social media under 1.5h/day (3 days)' },
      { id: 's3', label: 'Phone-free dinner at least once this week' },
    ],
  },
  {
    category: 'Mental wellbeing',
    emoji: '🧠',
    tasks: [
      { id: 'm1', label: 'Call or text one person you trust' },
      { id: 'm2', label: '5-minute journal: one thing stressing you + one thing in your control' },
      { id: 'm3', label: '5-minute breathing: 4 in, 4 hold, 6 out (3x this week)' },
    ],
  },
]

export default function RoutinePage() {
  const [checked, setChecked] = useState({})

  function toggle(id) {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const total = WEEKLY_ROUTINE.flatMap(c => c.tasks).length
  const done = Object.values(checked).filter(Boolean).length
  const pct = Math.round((done / total) * 100)

  return (
    <div className="min-h-screen bg-gray-950 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">Weekly Routine</h1>
          <p className="text-gray-500 text-xs">Check off as you go — resets each week</p>
        </div>

        {/* Progress */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-300 font-medium">This week's progress</span>
            <span className="text-sm font-bold text-purple-400">{done}/{total}</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
            <div
              className="h-3 rounded-full bg-purple-500 transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
          {done === total && (
            <p className="text-xs text-green-400 mt-2 text-center">🎉 Week complete — great work!</p>
          )}
        </div>

        {/* Categories */}
        {WEEKLY_ROUTINE.map(cat => (
          <div key={cat.category} className="bg-gray-900 rounded-2xl border border-gray-800 p-5 mb-4">
            <h2 className="text-sm font-semibold text-gray-300 mb-4">
              <span className="mr-2">{cat.emoji}</span>{cat.category}
            </h2>
            <div className="space-y-3">
              {cat.tasks.map(task => (
                <label key={task.id} className="flex items-start gap-3 cursor-pointer group">
                  <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors
                    ${checked[task.id]
                      ? 'bg-purple-600 border-purple-600'
                      : 'border-gray-600 group-hover:border-purple-500'}`}
                    onClick={() => toggle(task.id)}
                  >
                    {checked[task.id] && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-sm leading-relaxed transition-colors
                    ${checked[task.id] ? 'text-gray-500 line-through' : 'text-gray-300'}`}>
                    {task.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}

      </div>
    </div>
  )
}
