import { useNavigate } from 'react-router-dom'

export default function DetailPageShell({ emoji, title, subtitle, badge, children }) {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-gray-950 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          {emoji && <div className="text-4xl mb-3">{emoji}</div>}
          <h1 className="text-2xl font-bold text-white mb-1">{title}</h1>
          {subtitle && <p className="text-gray-500 text-xs">{subtitle}</p>}
          {badge}
        </div>
        {children}
        <button
          onClick={() => navigate(-1)}
          className="w-full py-3 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors text-sm mt-2"
        >
          ← Back
        </button>
      </div>
    </div>
  )
}
