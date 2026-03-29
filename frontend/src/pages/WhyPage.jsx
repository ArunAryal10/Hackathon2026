import { useNavigate } from 'react-router-dom'

const MEASURES = [
  { icon: '💸', label: 'Financial stress',  desc: 'Remittance burden, debt, income stability', pct: '40%',  bg: '#fff4ec', accent: '#ff5f1f' },
  { icon: '💓', label: 'HRV + Sleep',       desc: 'Heart rate variability, sleep quality',     pct: '25%',  bg: '#fdf0ff', accent: '#e040fb' },
  { icon: '📱', label: 'Behavior',           desc: 'Screen time, activity, exercise',           pct: '20%',  bg: '#f0fdf4', accent: '#16a34a' },
  { icon: '🧠', label: 'Self-report',        desc: 'Mood and stress rating',                    pct: '15%',  bg: '#fffbeb', accent: '#d97706' },
]

export default function WhyPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-cream-100 px-4 py-14 flex flex-col">
      <div className="max-w-lg mx-auto w-full flex-1 flex flex-col">

        {/* Back */}
        <button onClick={() => navigate('/')} className="text-sm text-gray-700 mb-8 text-left">← Back</button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">How MannChill works</h1>
          <p className="text-gray-700 text-sm leading-relaxed">
            We combine four signals into a single allostatic load score — the total physiological cost of stress on your body and mind.
          </p>
        </div>

        {/* Measurement breakdown */}
        <div className="space-y-3 flex-1">
          {MEASURES.map(item => (
            <div key={item.label} className="bg-white rounded-2xl p-4 flex items-center gap-4"
              style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.06)', border: `1.5px solid ${item.accent}25` }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: item.bg }}>
                {item.icon}
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-gray-900">{item.label}</div>
                <div className="text-xs text-gray-700 mt-0.5">{item.desc}</div>
              </div>
              <div className="text-sm font-extrabold" style={{ color: item.accent }}>{item.pct}</div>
            </div>
          ))}
        </div>

        {/* Note */}
        <div className="bg-white rounded-2xl p-4 mt-6 mb-6"
          style={{ border: '1px solid #f0e4ff', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <p className="text-xs text-gray-700 leading-relaxed">
            🔒 <span className="font-semibold text-gray-700">All data stays on your device.</span> Nothing is stored or shared externally. The scoring model runs on our server but receives only numbers — never identifiable information.
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          <div className="w-2 h-2 rounded-full bg-gray-200" />
          <div className="w-6 h-2 rounded-full bg-brand-500" />
          <div className="w-2 h-2 rounded-full bg-gray-200" />
        </div>

        <button
          onClick={() => navigate('/get-started')}
          className="btn-fruity w-full py-4 rounded-2xl font-bold text-base"
        >
          Next →
        </button>

      </div>
    </div>
  )
}
