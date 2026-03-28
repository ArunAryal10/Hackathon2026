import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

const BAND_COLORS = {
  low:      { bg: 'bg-green-900/30',  border: 'border-green-700',  text: 'text-green-400'  },
  moderate: { bg: 'bg-yellow-900/30', border: 'border-yellow-700', text: 'text-yellow-400' },
  high:     { bg: 'bg-orange-900/30', border: 'border-orange-700', text: 'text-orange-400' },
  severe:   { bg: 'bg-red-900/30',    border: 'border-red-700',    text: 'text-red-400'    },
}

const CATEGORY_ICON = {
  crisis:        '🆘',
  mental_health: '🧠',
  financial:     '💸',
  community:     '🤝',
  wellness:      '🌿',
}

const TYPE_BADGE = {
  crisis:        'bg-red-900/40 text-red-300 border-red-800',
  mental_health: 'bg-purple-900/40 text-purple-300 border-purple-800',
  financial:     'bg-yellow-900/40 text-yellow-300 border-yellow-800',
  community:     'bg-blue-900/40 text-blue-300 border-blue-800',
  wellness:      'bg-green-900/40 text-green-300 border-green-800',
}

function FreeBadge({ free, freeTier }) {
  if (free) return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-green-900/40 text-green-400 border border-green-800">
      Free
    </span>
  )
  if (freeTier) return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700">
      Free tier
    </span>
  )
  return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-500 border border-gray-700">
      Paid
    </span>
  )
}

function ResourceCard({ resource }) {
  const typeBadge = TYPE_BADGE[resource.type] || 'bg-gray-800 text-gray-400 border-gray-700'
  const icon = CATEGORY_ICON[resource.type] || '💡'

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 mb-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <h3 className="text-white font-semibold text-sm">{resource.title_en}</h3>
        </div>
        <FreeBadge free={resource.free} freeTier={resource.free_tier} />
      </div>

      {resource.title_ne && (
        <p className="text-xs text-gray-500 mb-2 ml-7">{resource.title_ne}</p>
      )}

      <p className="text-gray-300 text-sm leading-relaxed mb-2 ml-7">
        {resource.description_en}
      </p>

      {resource.description_ne && (
        <p className="text-xs text-gray-500 leading-relaxed mb-3 ml-7">
          {resource.description_ne}
        </p>
      )}

      <div className="flex items-center justify-between ml-7">
        <span className={`text-xs px-2 py-0.5 rounded-full border ${typeBadge}`}>
          {resource.type.replace('_', ' ')}
        </span>
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-purple-400 hover:text-purple-300 transition-colors underline underline-offset-2"
        >
          Visit →
        </a>
      </div>
    </div>
  )
}

export default function ResourcesPage() {
  const { band } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    axios.get(`/api/resources/${band}`)
      .then(res => setData(res.data))
      .catch(() => setError('Could not load resources. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [band])

  const colors = BAND_COLORS[band] || BAND_COLORS.moderate

  return (
    <div className="min-h-screen bg-gray-950 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">MannChill</h1>
          <p className="text-gray-500 text-xs">Resources & Support</p>
        </div>

        {loading && (
          <div className="text-center text-gray-500 py-20">Loading resources…</div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 rounded-lg px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {data && (
          <>
            {/* Band message */}
            <div className={`rounded-2xl border p-5 mb-6 ${colors.bg} ${colors.border}`}>
              <div className={`text-xs font-semibold uppercase tracking-wider mb-2 ${colors.text}`}>
                {data.label}
              </div>
              <p className="text-white text-sm leading-relaxed">{data.message_en}</p>
              {data.message_ne && (
                <p className="text-gray-400 text-xs mt-1 leading-relaxed">{data.message_ne}</p>
              )}
            </div>

            {/* Resource cards */}
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
              Support resources
            </h2>
            {data.resources.map(r => (
              <ResourceCard key={r.id} resource={r} />
            ))}
          </>
        )}

        <button
          onClick={() => navigate(-1)}
          className="w-full mt-2 py-3 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors text-sm"
        >
          ← Back
        </button>

      </div>
    </div>
  )
}
