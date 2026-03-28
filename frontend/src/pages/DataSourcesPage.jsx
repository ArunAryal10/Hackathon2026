import { useNavigate } from 'react-router-dom'

const SOURCES = [
  {
    icon: '⌚',
    title: 'Wearable',
    subtitle: 'Apple Watch / Fitbit / Garmin',
    status: 'synthetic',
    metrics: ['HRV (RMSSD)', 'Sleep duration', 'Sleep efficiency', 'Daily steps'],
  },
  {
    icon: '📱',
    title: 'Phone Usage',
    subtitle: 'iOS Screen Time / Android Digital Wellbeing',
    status: 'synthetic',
    metrics: ['Daily screen time', 'App usage breakdown'],
  },
  {
    icon: '🏦',
    title: 'Banking & Remittance',
    subtitle: 'Manual input (Plaid API for production)',
    status: 'manual',
    metrics: ['Monthly income', 'Remittance sent', 'Total debt', 'Income stability'],
  },
  {
    icon: '📓',
    title: 'Journal',
    subtitle: 'Self-report at intake',
    status: 'manual',
    metrics: ['Stress rating', 'Mood rating'],
  },
]

const STATUS_STYLE = {
  synthetic: { badge: 'bg-purple-900/40 text-purple-300 border-purple-800', label: 'Synthetic demo' },
  manual:    { badge: 'bg-blue-900/40 text-blue-300 border-blue-800',       label: 'Manual input'   },
  connected: { badge: 'bg-green-900/40 text-green-300 border-green-800',    label: 'Connected'      },
}

export default function DataSourcesPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-950 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Data Sources</h1>
          <p className="text-gray-500 text-xs">Where your stress signals come from</p>
        </div>

        <div className="space-y-4 mb-8">
          {SOURCES.map(s => {
            const st = STATUS_STYLE[s.status]
            return (
              <div key={s.title} className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{s.icon}</span>
                    <div>
                      <h2 className="text-white font-semibold text-sm">{s.title}</h2>
                      <p className="text-gray-500 text-xs">{s.subtitle}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${st.badge}`}>
                    {st.label}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 ml-9">
                  {s.metrics.map(m => (
                    <span key={m} className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-lg">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <div className="bg-gray-900 rounded-2xl border border-purple-900 p-4 mb-8">
          <p className="text-xs text-purple-300 leading-relaxed">
            <span className="font-semibold">Demo mode:</span> All data is synthetic, based on realistic Nepali diaspora profiles.
            In production, wearable and banking data would be pulled automatically via HealthKit and Plaid.
          </p>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="w-full py-3 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors text-sm"
        >
          ← Back
        </button>

      </div>
    </div>
  )
}
