import { useLocation, useNavigate } from 'react-router-dom'
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from 'recharts'

function StatCard({ label, value, unit, target, color }) {
  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <div className="flex items-end gap-1 mb-1">
        <span className="text-3xl font-bold" style={{ color }}>{value}</span>
        <span className="text-gray-400 text-sm mb-1">{unit}</span>
      </div>
      <p className="text-xs text-gray-600">{target}</p>
    </div>
  )
}

function GaugeBar({ label, value, max, color, target, targetLabel }) {
  const pct = Math.min((value / max) * 100, 100)
  const targetPct = Math.min((target / max) * 100, 100)
  return (
    <div className="mb-5">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-300">{label}</span>
        <span className="font-semibold" style={{ color }}>{value}</span>
      </div>
      <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
        <div className="absolute top-0 h-full w-0.5 bg-white/40" style={{ left: `${targetPct}%` }} />
      </div>
      <p className="text-xs text-gray-600 mt-1">Target: {targetLabel}</p>
    </div>
  )
}

export default function HRVDetailPage() {
  const { state } = useLocation()
  const navigate = useNavigate()

  const inputs = state?.inputs?.hrv_sleep
  const score = state?.result?.sub_scores?.hrv_sleep

  if (!inputs) { navigate('/'); return null }

  const rmssd = inputs.rmssd_ms
  const sleep = inputs.sleep_duration_hrs
  const efficiency = inputs.sleep_efficiency_pct

  function rmssdColor(v) {
    if (v >= 50) return '#4ade80'
    if (v >= 35) return '#facc15'
    if (v >= 20) return '#fb923c'
    return '#f87171'
  }

  function sleepColor(v) {
    if (v >= 7.5) return '#4ade80'
    if (v >= 6.5) return '#facc15'
    if (v >= 5.5) return '#fb923c'
    return '#f87171'
  }

  function effColor(v) {
    if (v >= 85) return '#4ade80'
    if (v >= 75) return '#facc15'
    if (v >= 65) return '#fb923c'
    return '#f87171'
  }

  return (
    <div className="min-h-screen bg-gray-950 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        <div className="text-center mb-8">
          <div className="text-3xl mb-2">💓</div>
          <h1 className="text-2xl font-bold text-white mb-1">HRV & Sleep</h1>
          <p className="text-gray-500 text-xs">Physiological stress signals</p>
          {score !== undefined && (
            <div className="mt-2 inline-block px-3 py-1 rounded-full bg-gray-800 text-gray-300 text-xs">
              Sub-score: <span className="font-semibold text-white">{Math.round(score)}/100</span> stress load
            </div>
          )}
        </div>

        {/* Key stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatCard label="HRV (RMSSD)" value={rmssd} unit="ms" color={rmssdColor(rmssd)} target="Target ≥ 50ms" />
          <StatCard label="Sleep" value={sleep} unit="hrs" color={sleepColor(sleep)} target="Target 7.5–9hrs" />
          <StatCard label="Efficiency" value={efficiency} unit="%" color={effColor(efficiency)} target="Target ≥ 85%" />
        </div>

        {/* Bar chart */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-5">vs. targets</h2>
          <GaugeBar label="HRV (RMSSD)" value={rmssd} max={100} color={rmssdColor(rmssd)} target={50} targetLabel="≥ 50ms" />
          <GaugeBar label="Sleep duration" value={sleep} max={10} color={sleepColor(sleep)} target={7.5} targetLabel="7.5 hrs" />
          <GaugeBar label="Sleep efficiency" value={efficiency} max={100} color={effColor(efficiency)} target={85} targetLabel="85%" />
        </div>

        {/* Context */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 mb-8">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">What this means</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            HRV (heart rate variability) reflects how well your nervous system recovers from stress.
            Low RMSSD ({'<'}35ms) is linked to elevated allostatic load. Paired with poor sleep, it compounds
            physical and emotional stress significantly.
          </p>
        </div>

        <button onClick={() => navigate(-1)} className="w-full py-3 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors text-sm">
          ← Back
        </button>

      </div>
    </div>
  )
}
