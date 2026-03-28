import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { computeWeights, STORAGE_KEYS } from '../utils/permissions'

const PERMISSION_ITEMS = [
  {
    key: 'hrv',
    icon: '💓',
    title: 'HRV data',
    description: 'Heart rate variability from your wearable (Apple Watch, Fitbit, Garmin)',
    weight: '12.5%',
    impact: 'Physiological stress signal',
  },
  {
    key: 'sleep',
    icon: '😴',
    title: 'Sleep data',
    description: 'Sleep duration and efficiency from your wearable or phone',
    weight: '12.5%',
    impact: 'Recovery & restoration signal',
  },
  {
    key: 'financial',
    icon: '💸',
    title: 'Financial data',
    description: 'Income, remittance amount, and debt — entered manually by you',
    weight: '40%',
    impact: 'Dominant stressor for Nepali diaspora',
  },
  {
    key: 'behavioral',
    icon: '📱',
    title: 'Phone & activity data',
    description: 'Screen time from iOS/Android + step count from your phone or wearable',
    weight: '20%',
    impact: 'Lifestyle & behavioral patterns',
  },
  {
    key: 'selfReport',
    icon: '🧠',
    title: 'Mood & stress self-report',
    description: 'Your own rating of stress and mood at check-in',
    weight: '15%',
    impact: 'Subjective validation of objective signals',
  },
]

export default function PermissionsPage() {
  const navigate = useNavigate()
  const [permissions, setPermissions] = useState({
    hrv: true, sleep: true, financial: true, behavioral: true, selfReport: true,
  })

  function toggle(key) {
    setPermissions(p => ({ ...p, [key]: !p[key] }))
  }

  const anyUnchecked = Object.values(permissions).some(v => !v)
  const weights = computeWeights(permissions)

  function handleStart() {
    localStorage.setItem(STORAGE_KEYS.PERMISSIONS, JSON.stringify(permissions))
    localStorage.setItem(STORAGE_KEYS.WEIGHTS, JSON.stringify(weights))
    navigate('/home')
  }

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-12">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🔒</div>
          <h1 className="text-2xl font-bold text-white mb-2">Data permissions</h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            Choose what MannChill can use. The model adapts its weights to what you share.
            You can change this anytime in Settings.
          </p>
        </div>

        {/* Permission items */}
        <div className="space-y-3 mb-6">
          {PERMISSION_ITEMS.map(item => (
            <button
              key={item.key}
              onClick={() => toggle(item.key)}
              className={`w-full text-left rounded-2xl border p-4 transition-all ${
                permissions[item.key]
                  ? 'bg-purple-900/20 border-purple-700'
                  : 'bg-gray-900 border-gray-800 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                <div className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border transition-colors ${
                  permissions[item.key] ? 'bg-purple-600 border-purple-600' : 'border-gray-600'
                }`}>
                  {permissions[item.key] && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-base">{item.icon}</span>
                    <span className="text-sm font-semibold text-white">
                      I agree to share my {item.title}
                    </span>
                    <span className="text-xs text-purple-400 font-medium ml-auto">{item.weight}</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{item.description}</p>
                  <p className="text-xs text-gray-600 mt-1">→ {item.impact}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Accuracy disclaimer */}
        {anyUnchecked && (
          <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-2xl p-4 mb-6">
            <p className="text-xs text-yellow-300/80 leading-relaxed">
              <span className="font-semibold">Improve your accuracy:</span> Some data sources are
              unchecked. The model will redistribute weights across permitted sources, but permitting
              more data leads to a more accurate and personalised allostatic load score.
            </p>
          </div>
        )}

        <button
          onClick={handleStart}
          className="w-full py-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-base transition-colors"
        >
          Start MannChill →
        </button>

        <p className="text-center text-xs text-gray-600 mt-4">
          All data stays on your device. Nothing is sent to any server except for scoring.
        </p>

      </div>
    </div>
  )
}
