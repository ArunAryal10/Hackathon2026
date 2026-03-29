import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'

const STATUS_STYLE = {
  synthetic:  { badge: 'bg-purple-50 text-purple-700 border-purple-200', label: 'Synthetic demo' },
  manual:     { badge: 'bg-blue-50 text-blue-700 border-blue-200',       label: 'Manual input'   },
  connected:  { badge: 'bg-green-50 text-green-700 border-green-200',    label: 'Connected'      },
  connecting: { badge: 'bg-yellow-50 text-yellow-700 border-yellow-200', label: 'Connecting…'   },
}

function SourceCard({ icon, title, subtitle, status, metrics, children }) {
  const st = STATUS_STYLE[status] || STATUS_STYLE.synthetic
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <h2 className="text-gray-900 font-semibold text-sm">{title}</h2>
            <p className="text-gray-500 text-xs">{subtitle}</p>
          </div>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full border ${st.badge}`}>
          {st.label}
        </span>
      </div>
      <div className="flex flex-wrap gap-2 ml-9 mb-2">
        {metrics.map(m => (
          <span key={m.label} className="text-xs bg-gray-50 text-gray-700 px-2 py-1 rounded-lg">
            {m.label}{m.value !== undefined ? `: ${m.value}` : ''}
          </span>
        ))}
      </div>
      {children}
    </div>
  )
}

export default function DataSourcesPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [whoopConnected, setWhoopConnected] = useState(false)
  const [whoopData, setWhoopData] = useState(null)
  const [whoopLoading, setWhoopLoading] = useState(false)
  const [whoopError, setWhoopError] = useState(null)

  // On mount: check if returning from OAuth or already connected
  useEffect(() => {
    const fromOAuth = searchParams.get('whoop') === 'connected'
    if (fromOAuth) {
      localStorage.setItem('whoop_connected', 'true')
      // Clean up URL
      window.history.replaceState({}, '', '/sources')
    }
    const stored = localStorage.getItem('whoop_connected') === 'true'
    if (stored || fromOAuth) {
      setWhoopConnected(true)
      fetchWhoopData()
    }
  }, [])

  function fetchWhoopData() {
    setWhoopLoading(true)
    setWhoopError(null)
    axios.get('/api/whoop/data')
      .then(res => {
        setWhoopData(res.data)
        // Persist for HomePage to use
        localStorage.setItem('whoop_data', JSON.stringify(res.data))
      })
      .catch(err => {
        const msg = err.response?.data?.detail || 'Could not fetch WHOOP data'
        setWhoopError(msg)
        if (err.response?.status === 401) {
          localStorage.removeItem('whoop_connected')
          localStorage.removeItem('whoop_data')
          setWhoopConnected(false)
        }
      })
      .finally(() => setWhoopLoading(false))
  }

  function handleDisconnect() {
    axios.delete('/api/whoop/disconnect').finally(() => {
      localStorage.removeItem('whoop_connected')
      localStorage.removeItem('whoop_data')
      setWhoopConnected(false)
      setWhoopData(null)
    })
  }

  const whoopMetrics = whoopData
    ? [
        { label: 'HRV (RMSSD)', value: `${whoopData.rmssd_ms} ms` },
        { label: 'Sleep', value: `${whoopData.sleep_duration_hrs} hrs` },
        { label: 'Sleep efficiency', value: `${whoopData.sleep_efficiency_pct}%` },
        ...(whoopData.resting_heart_rate ? [{ label: 'Resting HR', value: `${whoopData.resting_heart_rate} bpm` }] : []),
        ...(whoopData.recovery_score != null ? [{ label: 'Recovery', value: `${whoopData.recovery_score}%` }] : []),
        ...(whoopData.strain_score != null ? [{ label: 'Strain', value: whoopData.strain_score }] : []),
        ...(whoopData.exercise_mins_week != null ? [{ label: 'Exercise (7d)', value: `${Math.round(whoopData.exercise_mins_week)} min` }] : []),
      ]
    : [
        { label: 'HRV (RMSSD)' },
        { label: 'Sleep duration' },
        { label: 'Sleep efficiency' },
        { label: 'Resting HR' },
      ]

  return (
    <div className="min-h-screen bg-cream-100 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Data Sources</h1>
          <p className="text-gray-500 text-xs">Where your stress signals come from</p>
        </div>

        <div className="space-y-4 mb-8">

          {/* WHOOP */}
          <SourceCard
            icon="⌚"
            title="WHOOP"
            subtitle="Heart rate variability, sleep, recovery"
            status={whoopConnected ? 'connected' : 'synthetic'}
            metrics={whoopMetrics}
          >
            {whoopLoading && (
              <p className="text-xs text-gray-400 ml-9 mt-1">Fetching latest data…</p>
            )}
            {whoopError && (
              <p className="text-xs text-red-500 ml-9 mt-1">{whoopError}</p>
            )}
            {whoopConnected ? (
              <div className="ml-9 mt-3 flex gap-2">
                <button
                  onClick={fetchWhoopData}
                  className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Refresh
                </button>
                <button
                  onClick={handleDisconnect}
                  className="text-xs px-3 py-1.5 rounded-lg border border-red-100 text-red-500 hover:bg-red-50 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="ml-9 mt-3">
                <a
                  href="/api/whoop/auth"
                  className="inline-block text-xs px-4 py-1.5 rounded-lg text-white font-medium transition-all"
                  style={{ background: 'linear-gradient(135deg, #ff5f1f, #e040fb)' }}
                >
                  Connect WHOOP
                </a>
              </div>
            )}
          </SourceCard>

          {/* Phone Usage */}
          <SourceCard
            icon="📱"
            title="Phone Usage"
            subtitle="iOS Screen Time / Android Digital Wellbeing"
            status="synthetic"
            metrics={[{ label: 'Daily screen time' }, { label: 'App usage breakdown' }]}
          />

          {/* Banking */}
          <SourceCard
            icon="🏦"
            title="Banking & Remittance"
            subtitle="Manual input (Plaid API for production)"
            status="manual"
            metrics={[
              { label: 'Monthly income' }, { label: 'Remittance sent' },
              { label: 'Total debt' }, { label: 'Income stability' },
            ]}
          />

          {/* Journal */}
          <SourceCard
            icon="📓"
            title="Journal"
            subtitle="Self-report at intake"
            status="manual"
            metrics={[{ label: 'Stress rating' }, { label: 'Mood rating' }]}
          />
        </div>

        {whoopConnected && whoopData && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
            <p className="text-xs text-green-800 leading-relaxed">
              <span className="font-semibold">WHOOP connected —</span> your real HRV and sleep data
              is now being used in your stress score. Go to{' '}
              <button onClick={() => navigate('/home')} className="underline font-semibold">
                Home
              </button>{' '}
              to see your updated score.
            </p>
          </div>
        )}

        {!whoopConnected && (
          <div className="bg-white rounded-2xl border border-brand-200 p-4 mb-8">
            <p className="text-xs text-brand-400 leading-relaxed">
              <span className="font-semibold">Demo mode:</span> All wearable data is synthetic.
              Connect WHOOP above to use your real HRV and sleep data.
            </p>
          </div>
        )}

        <button
          onClick={() => navigate(-1)}
          className="w-full py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-white transition-colors text-sm"
        >
          Back
        </button>

      </div>
    </div>
  )
}
