import { useLocation, useNavigate } from 'react-router-dom'

export default function DashboardPage() {
  const { state } = useLocation()
  const navigate = useNavigate()

  if (!state?.result) {
    navigate('/')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-950 py-10 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Your Results</h1>
        <p className="text-gray-400 text-sm mb-8">Dashboard coming next</p>
        <pre className="text-left text-xs text-gray-400 bg-gray-900 rounded-xl p-4 overflow-auto">
          {JSON.stringify(state.result, null, 2)}
        </pre>
        <button
          onClick={() => navigate('/intake')}
          className="mt-6 py-3 px-8 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-colors"
        >
          ← Recalculate
        </button>
      </div>
    </div>
  )
}
