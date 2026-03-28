import { useNavigate } from 'react-router-dom'

const STATS = [
  { value: '56%', label: 'of Nepali diaspora send >20% of income as remittance' },
  { value: '3x', label: 'higher burnout risk for diaspora vs. non-remitters' },
  { value: '1 in 3', label: 'Nepali migrants report moderate-severe psychological distress' },
]

const PERMISSIONS = [
  { icon: '💓', label: 'Wearable data (HRV, sleep)' },
  { icon: '📱', label: 'Screen time & activity' },
  { icon: '💸', label: 'Financial inputs (self-reported)' },
  { icon: '🧠', label: 'Self-reported mood & stress' },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-12">
      <div className="max-w-lg mx-auto">

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">🧘</div>
          <h1 className="text-4xl font-bold text-white mb-3">MannChill</h1>
          <p className="text-purple-300 text-lg font-medium mb-3">मनशान्ति — Peace of mind</p>
          <p className="text-gray-400 text-sm leading-relaxed">
            Financial stress is the silent burden of every Nepali diaspora family.
            MannChill measures your allostatic load — the total cost of chronic stress
            on your body and mind — and tells you exactly what to do about it.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {STATS.map(s => (
            <div key={s.value} className="bg-gray-900 rounded-xl border border-gray-800 p-3 text-center">
              <div className="text-xl font-bold text-purple-400 mb-1">{s.value}</div>
              <div className="text-xs text-gray-500 leading-tight">{s.label}</div>
            </div>
          ))}
        </div>

        {/* What it measures */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
            What MannChill measures
          </h2>
          <div className="space-y-3">
            {[
              { icon: '💸', label: 'Financial stress', desc: 'Remittance burden, debt, income stability', pct: '40%' },
              { icon: '💓', label: 'HRV + Sleep', desc: 'Heart rate variability, sleep quality', pct: '25%' },
              { icon: '📱', label: 'Behavior', desc: 'Screen time, activity, exercise', pct: '20%' },
              { icon: '🧠', label: 'Self-report', desc: 'Mood and stress rating', pct: '15%' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="text-xl w-7">{item.icon}</span>
                <div className="flex-1">
                  <div className="text-sm text-white font-medium">{item.label}</div>
                  <div className="text-xs text-gray-500">{item.desc}</div>
                </div>
                <div className="text-xs font-semibold text-purple-400">{item.pct}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Permissions */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 mb-8">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
            Data we use
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {PERMISSIONS.map(p => (
              <div key={p.label} className="flex items-center gap-2 text-sm text-gray-400">
                <span>{p.icon}</span><span>{p.label}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-3">
            All data stays on your device. Nothing is stored or shared.
          </p>
        </div>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 mb-6 text-center">
          <p className="text-gray-400 text-sm mb-1">Ready to understand your stress?</p>
          <p className="text-gray-600 text-xs">Takes 2 minutes. Your data stays on your device.</p>
        </div>

        <button
          onClick={() => navigate('/login')}
          className="w-full py-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-base transition-colors"
        >
          Get started — create account →
        </button>

      </div>
    </div>
  )
}
