import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { isOnboarded } from '../utils/permissions'

const STATS = [
  { value: '77%',  label: 'of Nepali households depend on remittance income',  color: '#111111', cite: 'NLSS-IV, CBS Nepal 2022/23' },
  { value: '39%',  label: 'of migrant workers globally report depression',     color: '#111111', cite: 'Liem et al., 2021 meta-analysis' },
  { value: '27%',  label: 'of Nepal\'s GDP comes from remittances alone',      color: '#111111', cite: 'World Bank, 2023' },
]

export default function LandingPage() {
  const navigate = useNavigate()

  useEffect(() => {
    if (isOnboarded()) navigate('/home', { replace: true })
  }, [])

  return (
    <div className="min-h-screen bg-cream-100 px-4 py-14 flex flex-col">
      <div className="max-w-lg mx-auto w-full flex-1 flex flex-col">

        {/* Hero */}
        <div className="text-center mb-10 flex-1 flex flex-col justify-center">
          <div className="text-7xl mb-5">🧘</div>
          <h1 className="text-5xl font-extrabold mb-3 tracking-tight" style={{ color: '#111111' }}>MannChill</h1>
          <p className="text-xl font-semibold mb-5" style={{ color: '#111111' }}>
            मनशान्ति — Peace of mind
          </p>
          <p className="text-gray-700 text-base leading-relaxed max-w-sm mx-auto">
            Financial stress is the <span className="font-semibold">silent burden</span> of every Nepali diaspora family. You deserve tools built for your reality.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-10">
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider text-center mb-4">The reality</p>
          <div className="grid grid-cols-3 gap-3">
            {STATS.map(s => (
              <div key={s.value} className="bg-white rounded-2xl p-4 text-center"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #e5e5e5' }}>
                <div className="text-2xl font-extrabold mb-1" style={{ color: s.color }}>{s.value}</div>
                <div className="text-[11px] text-gray-700 leading-tight">{s.label}</div>
                {s.cite && <div className="text-[9px] text-gray-400 mt-1 italic">{s.cite}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          <div className="w-6 h-2 rounded-full bg-gray-900" />
          <div className="w-2 h-2 rounded-full bg-gray-200" />
          <div className="w-2 h-2 rounded-full bg-gray-200" />
        </div>

        <button
          onClick={() => navigate('/why')}
          className="btn-fruity w-full py-4 rounded-2xl font-bold text-base"
        >
          Learn more →
        </button>

        <p className="text-center text-xs text-gray-700 mt-4">
          Already have an account?{' '}
          <button onClick={() => navigate('/signin')} className="underline font-medium" style={{ color: '#111111' }}>Sign in</button>
        </p>
        <p className="text-center text-xs text-gray-400 mt-2">
          <button onClick={() => navigate('/research')} className="underline">View our research & evidence base</button>
        </p>

      </div>
    </div>
  )
}
