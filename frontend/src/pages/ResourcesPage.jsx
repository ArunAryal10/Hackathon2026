import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import resourcesData from '../data/resources.json'

const BAND_COLORS = {
  low:      { bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-700'  },
  moderate: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' },
  high:     { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
  severe:   { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-700'    },
}

const CATEGORY_ICON = {
  crisis:        '🆘',
  mental_health: '🧠',
  financial:     '💸',
  community:     '🤝',
  wellness:      '🌿',
}

const TYPE_BADGE = {
  crisis:        'bg-red-50 text-red-700 border-red-200',
  mental_health: 'bg-purple-50 text-purple-700 border-purple-200',
  financial:     'bg-yellow-50 text-yellow-700 border-yellow-200',
  community:     'bg-blue-50 text-blue-700 border-blue-200',
  wellness:      'bg-green-50 text-green-700 border-green-200',
}

function FreeBadge({ free, freeTier }) {
  if (free) return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
      Free
    </span>
  )
  if (freeTier) return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-white text-gray-800 border border-gray-200">
      Free tier
    </span>
  )
  return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-white text-gray-700 border border-gray-200">
      Paid
    </span>
  )
}

function ResourceCard({ resource }) {
  const typeBadge = TYPE_BADGE[resource.type] || 'bg-white text-gray-800 border-gray-200'
  const icon = CATEGORY_ICON[resource.type] || '💡'

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <h3 className="text-gray-900 font-semibold text-sm">{resource.title_en}</h3>
        </div>
        <FreeBadge free={resource.free} freeTier={resource.free_tier} />
      </div>

      {resource.title_ne && (
        <p className="text-xs text-gray-700 mb-2 ml-7">{resource.title_ne}</p>
      )}

      <p className="text-gray-700 text-sm leading-relaxed mb-2 ml-7">
        {resource.description_en}
      </p>

      {resource.description_ne && (
        <p className="text-xs text-gray-700 leading-relaxed mb-3 ml-7">
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
          className="text-xs text-brand-500 hover:text-brand-400 transition-colors underline underline-offset-2"
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

  useEffect(() => {
    const entry = resourcesData[band] || resourcesData.moderate
    setData(entry)
    setLoading(false)
  }, [band])

  const colors = BAND_COLORS[band] || BAND_COLORS.moderate

  return (
    <div className="min-h-screen bg-cream-100 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">MannChill</h1>
          <p className="text-gray-700 text-xs">Resources & Support</p>
        </div>

        {loading && (
          <div className="text-center text-gray-700 py-20">Loading resources…</div>
        )}

        {data && (
          <>
            {/* Band message */}
            <div className={`rounded-2xl border p-5 mb-6 ${colors.bg} ${colors.border}`}>
              <div className={`text-xs font-semibold uppercase tracking-wider mb-2 ${colors.text}`}>
                {data.label}
              </div>
              <p className="text-gray-900 text-sm leading-relaxed">{data.message_en}</p>
              {data.message_ne && (
                <p className="text-gray-700 text-xs mt-1 leading-relaxed">{data.message_ne}</p>
              )}
            </div>

            {/* Resource cards */}
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
              Support resources
            </h2>
            {data.resources.map(r => (
              <ResourceCard key={r.id} resource={r} />
            ))}
          </>
        )}

        <button
          onClick={() => navigate(-1)}
          className="w-full mt-2 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-white transition-colors text-sm"
        >
          ← Back
        </button>

      </div>
    </div>
  )
}
