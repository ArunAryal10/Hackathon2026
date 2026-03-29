import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { STORAGE_KEYS } from '../utils/permissions'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 60 }, (_, i) => CURRENT_YEAR - 18 - i)

const inputStyle = {
  width: '100%',
  background: '#ffffff',
  border: '1.5px solid #e8d8f8',
  borderRadius: '0.75rem',
  padding: '0.75rem 1rem',
  color: '#111111',
  fontSize: '0.9rem',
  outline: 'none',
  transition: 'border-color 0.2s',
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('email')
  const [contact, setContact] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [birthMonth, setBirthMonth] = useState('')
  const [error, setError] = useState(null)

  function handleContinue() {
    if (!contact.trim()) { setError('Please enter your email or phone number.'); return }
    if (!birthYear || !birthMonth) { setError('Please enter your date of birth.'); return }
    setError(null)
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify({
      contact: contact.trim(),
      birthYear: Number(birthYear),
      birthMonth: Number(birthMonth),
    }))
    navigate('/permissions')
  }

  return (
    <div className="min-h-screen bg-cream-100 px-4 py-12 flex flex-col">
      <div className="max-w-lg mx-auto w-full flex-1">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-4xl mb-3">🧘</div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: '#111111' }}>Create your account</h1>
          <p className="text-sm" style={{ color: '#555555' }}>No passwords. We use a one-time code.</p>
        </div>

        {/* Toggle */}
        <div className="flex bg-white rounded-xl p-1 mb-6"
          style={{ border: '1.5px solid #e8d8f8', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          {['email', 'phone'].map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setContact('') }}
              className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all capitalize"
              style={mode === m
                ? { background: 'linear-gradient(135deg, #ff5f1f, #e040fb)', color: 'white' }
                : { color: '#555555' }
              }
            >
              {m === 'email' ? '✉️ Email' : '📱 Phone'}
            </button>
          ))}
        </div>

        {/* Contact input */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2" style={{ color: '#111111' }}>
            {mode === 'email' ? 'Email address' : 'Phone number'}
          </label>
          <input
            type={mode === 'email' ? 'email' : 'tel'}
            value={contact}
            onChange={e => setContact(e.target.value)}
            placeholder={mode === 'email' ? 'you@example.com' : '+1 (555) 000-0000'}
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#e040fb'}
            onBlur={e => e.target.style.borderColor = '#e8d8f8'}
          />
        </div>

        {/* Age */}
        <div className="mb-8">
          <label className="block text-sm font-semibold mb-1" style={{ color: '#111111' }}>
            Date of birth
          </label>
          <p className="text-xs mb-3" style={{ color: '#555555' }}>
            Year and month only — used to calibrate age-related HRV norms.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={birthYear}
              onChange={e => setBirthYear(e.target.value)}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#e040fb'}
              onBlur={e => e.target.style.borderColor = '#e8d8f8'}
            >
              <option value="">Year</option>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select
              value={birthMonth}
              onChange={e => setBirthMonth(e.target.value)}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#e040fb'}
              onBlur={e => e.target.style.borderColor = '#e8d8f8'}
            >
              <option value="">Month</option>
              {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
          </div>
        </div>

        {error && (
          <div className="rounded-xl px-4 py-3 mb-4 text-sm"
            style={{ background: '#fff0f3', border: '1px solid #fca5a5', color: '#b91c1c' }}>
            {error}
          </div>
        )}

        <button onClick={handleContinue} className="btn-fruity w-full py-4 rounded-2xl font-bold text-base">
          Continue →
        </button>

        <p className="text-center text-xs mt-6" style={{ color: '#888888' }}>
          Your data stays on this device. We never store or share it.
        </p>

      </div>
    </div>
  )
}
