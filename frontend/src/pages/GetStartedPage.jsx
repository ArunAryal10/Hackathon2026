import { useNavigate } from 'react-router-dom'

const FEATURES = [
  { icon: '🗓️', label: 'Build routines', desc: 'Weekly habit plans tailored to your life', bg: '#f5f5f5', color: '#111111' },
  { icon: '🔒', label: '100% private',   desc: 'Data never leaves your device',           bg: '#f5f5f5', color: '#111111' },
  { icon: '🌏', label: 'Bilingual',      desc: 'English + Nepali guidance',               bg: '#f5f5f5', color: '#111111' },
  { icon: '⚡', label: '2-min setup',    desc: 'Quick onboarding, instant insights',      bg: '#f5f5f5', color: '#111111' },
]

export default function GetStartedPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-cream-100 px-4 py-14 flex flex-col">
      <div className="max-w-lg mx-auto w-full flex-1 flex flex-col">

        {/* Back */}
        <button onClick={() => navigate('/why')} className="text-sm text-gray-700 mb-8 text-left">← Back</button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Ready to start?</h1>
          <p className="text-gray-700 text-sm leading-relaxed">
            Takes 2 minutes. Create an account to get your personalised allostatic load score.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-3 mb-8 flex-1">
          {FEATURES.map(f => (
            <div key={f.label} className="bg-white rounded-2xl p-4"
              style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.06)', border: '1px solid #e5e5e5' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3"
                style={{ background: f.bg }}>
                {f.icon}
              </div>
              <div className="text-sm font-bold text-gray-900">{f.label}</div>
              <div className="text-xs text-gray-700 mt-0.5">{f.desc}</div>
            </div>
          ))}
        </div>

        {/* Quote */}
        <div className="bg-white rounded-2xl p-5 mb-6 text-center"
          style={{ border: '1px solid #e5e5e5', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <p className="text-sm font-medium text-gray-700 leading-relaxed italic">
            "Understanding your stress is the first step to managing it."
          </p>
          <p className="text-xs text-gray-700 mt-2">— MannChill</p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          <div className="w-2 h-2 rounded-full bg-gray-200" />
          <div className="w-2 h-2 rounded-full bg-gray-200" />
          <div className="w-6 h-2 rounded-full bg-gray-900" />
        </div>

        <button
          onClick={() => navigate('/permissions')}
          className="btn-fruity w-full py-4 rounded-2xl font-bold text-base"
        >
          Create account →
        </button>

        <p className="text-center text-xs text-gray-700 mt-4">
          Already have an account?{' '}
          <button onClick={() => navigate('/signin')} className="underline font-medium" style={{ color: '#111111' }}>Sign in</button>
        </p>

      </div>
    </div>
  )
}
