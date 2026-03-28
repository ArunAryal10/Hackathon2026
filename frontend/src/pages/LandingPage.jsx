import { useNavigate } from 'react-router-dom'

export default function LandingPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-lg">
        <div className="text-5xl mb-4">🧘</div>
        <h1 className="text-4xl font-bold text-white mb-3">MannChill</h1>
        <p className="text-gray-400 mb-2 text-lg">Understand your stress. Take back control.</p>
        <p className="text-gray-500 text-sm mb-8">
          MannChill combines financial, physiological, and behavioral signals to give Nepali diaspora
          communities a clear picture of their allostatic load — and what to do about it.
        </p>
        <button
          onClick={() => navigate('/intake')}
          className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-base transition-colors"
        >
          Get started →
        </button>
      </div>
    </div>
  )
}
