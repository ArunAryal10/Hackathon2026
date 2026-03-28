import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { STORAGE_KEYS } from '../utils/permissions'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 60 }, (_, i) => CURRENT_YEAR - 18 - i)

export default function LoginPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('email') // 'email' | 'phone'
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
    <div className="min-h-screen bg-gray-950 px-4 py-12 flex flex-col">
      <div className="max-w-lg mx-auto w-full flex-1">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-4xl mb-3">🧘</div>
          <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
          <p className="text-gray-500 text-sm">No passwords. We send you a one-time code.</p>
        </div>

        {/* Toggle */}
        <div className="flex bg-gray-900 rounded-xl p-1 mb-6 border border-gray-800">
          {['email', 'phone'].map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setContact('') }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                mode === m ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {m === 'email' ? '✉️ Email' : '📱 Phone'}
            </button>
          ))}
        </div>

        {/* Contact input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {mode === 'email' ? 'Email address' : 'Phone number'}
          </label>
          <input
            type={mode === 'email' ? 'email' : 'tel'}
            value={contact}
            onChange={e => setContact(e.target.value)}
            placeholder={mode === 'email' ? 'you@example.com' : '+1 (555) 000-0000'}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        {/* Age */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-300 mb-2">Date of birth</label>
          <p className="text-xs text-gray-500 mb-3">Year and month only — used to calibrate age-related HRV norms.</p>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={birthYear}
              onChange={e => setBirthYear(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
            >
              <option value="">Year</option>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select
              value={birthMonth}
              onChange={e => setBirthMonth(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
            >
              <option value="">Month</option>
              {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 rounded-lg px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleContinue}
          className="w-full py-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-base transition-colors"
        >
          Continue →
        </button>

        <p className="text-center text-xs text-gray-600 mt-6">
          Your data stays on this device. We never store or share it.
        </p>

      </div>
    </div>
  )
}
