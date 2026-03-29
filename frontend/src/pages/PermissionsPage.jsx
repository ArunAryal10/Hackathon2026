import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { computeWeights, STORAGE_KEYS } from '../utils/permissions'

const PERMISSION_ITEMS = [
  { key: 'hrv',        icon: '💓', title: 'HRV data',              description: 'Heart rate variability from your wearable (Apple Watch, Fitbit, Garmin)', weight: '12.5%', impact: 'Physiological stress signal',          bg: '#fdf0ff', accent: '#e040fb' },
  { key: 'sleep',      icon: '😴', title: 'Sleep data',             description: 'Sleep duration and efficiency from your wearable or phone',               weight: '12.5%', impact: 'Recovery & restoration signal',        bg: '#eff6ff', accent: '#3b82f6' },
  { key: 'financial',  icon: '💸', title: 'Financial data',         description: 'Income, remittance amount, and debt — entered manually by you',           weight: '40%',   impact: 'Dominant stressor for Nepali diaspora', bg: '#fff4ec', accent: '#ff5f1f' },
  { key: 'behavioral', icon: '📱', title: 'Phone & activity data',  description: 'Screen time from iOS/Android + step count from your phone or wearable',  weight: '20%',   impact: 'Lifestyle & behavioral patterns',       bg: '#f0fdf4', accent: '#16a34a' },
  { key: 'selfReport', icon: '🧠', title: 'Mood & stress self-report', description: 'Your own rating of stress and mood at check-in',                       weight: '15%',   impact: 'Subjective validation of objective signals', bg: '#fffbeb', accent: '#d97706' },
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
    <div className="min-h-screen bg-cream-100 px-4 py-12">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🔒</div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#111111' }}>Your data, your choice</h1>
          <p className="text-sm leading-relaxed" style={{ color: '#111111' }}>
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
              className="w-full text-left rounded-2xl p-4 transition-all"
              style={{
                background: permissions[item.key] ? item.bg : '#faf5ff',
                border: `1.5px solid ${permissions[item.key] ? item.accent + '60' : '#e8d8f8'}`,
                boxShadow: permissions[item.key] ? `0 2px 12px ${item.accent}18` : 'none',
                opacity: permissions[item.key] ? 1 : 0.6,
              }}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                <div className="mt-0.5 w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    background: permissions[item.key] ? 'linear-gradient(135deg, #ff5f1f, #e040fb)' : '#ffffff',
                    border: permissions[item.key] ? 'none' : '1.5px solid #d0b0f0',
                  }}>
                  {permissions[item.key] && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-base">{item.icon}</span>
                    <span className="text-sm font-semibold" style={{ color: '#111111' }}>
                      I agree to share my {item.title}
                    </span>
                    <span className="text-xs font-bold ml-auto" style={{ color: item.accent }}>{item.weight}</span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: '#555555' }}>{item.description}</p>
                  <p className="text-xs mt-1" style={{ color: '#888888' }}>→ {item.impact}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Accuracy disclaimer */}
        {anyUnchecked && (
          <div className="rounded-2xl p-4 mb-6"
            style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
            <p className="text-xs leading-relaxed" style={{ color: '#92400e' }}>
              <span className="font-semibold">Improve your accuracy:</span> Some data sources are
              unchecked. The model will redistribute weights, but more data means a more accurate and
              personalised allostatic load score.
            </p>
          </div>
        )}

        <button onClick={handleStart} className="btn-fruity w-full py-4 rounded-2xl font-bold text-base">
          Start MannChill →
        </button>

        <p className="text-center text-xs mt-4" style={{ color: '#888888' }}>
          All data stays on your device. Nothing is sent to any server except for scoring.
        </p>

      </div>
    </div>
  )
}
