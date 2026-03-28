import { useLocation, useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { scoreColor } from '../utils/colors'

function StatRow({ label, value, highlight, note }) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-gray-800 last:border-0">
      <div>
        <p className="text-sm text-gray-300">{label}</p>
        {note && <p className="text-xs text-gray-600 mt-0.5">{note}</p>}
      </div>
      <span className={`text-sm font-semibold ml-4 ${highlight ? 'text-red-400' : 'text-white'}`}>{value}</span>
    </div>
  )
}

export default function FinancialDetailPage() {
  const { state } = useLocation()
  const navigate = useNavigate()

  const fin = state?.inputs?.financial
  const score = state?.result?.sub_scores?.financial

  if (!fin) { navigate('/'); return null }

  const income = fin.monthly_income_usd
  const remittance = fin.monthly_remittance_usd
  const debt = fin.total_debt_usd
  const stability = fin.income_stability

  const remittancePct = income > 0 ? ((remittance / income) * 100).toFixed(1) : 0
  const debtToIncome = income > 0 ? (debt / income).toFixed(1) : 0
  const remittanceHigh = remittancePct > 15
  const debtHigh = debtToIncome > 3

  const chartData = [
    { name: 'Remittance', value: remittance, fill: remittanceHigh ? '#f87171' : '#4ade80' },
    { name: 'Remaining', value: Math.max(income - remittance, 0), fill: '#374151' },
  ]

  return (
    <div className="min-h-screen bg-gray-950 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        <div className="text-center mb-8">
          <div className="text-3xl mb-2">💸</div>
          <h1 className="text-2xl font-bold text-white mb-1">Financial Stress</h1>
          <p className="text-gray-500 text-xs">Remittance burden & debt load</p>
          {score !== undefined && (
            <div className="mt-2 inline-block px-3 py-1 rounded-full bg-gray-800 text-gray-300 text-xs">
              Sub-score: <span className="font-semibold" style={{ color: scoreColor(score) }}>{Math.round(score)}/100</span> stress load
            </div>
          )}
        </div>

        {/* Remittance chart */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-1">Income breakdown</h2>
          <p className="text-xs text-gray-500 mb-4">Monthly income: <span className="text-white">${income.toLocaleString()}</span></p>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30, top: 0, bottom: 0 }}>
              <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 10 }} tickFormatter={v => `$${v}`} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#d1d5db', fontSize: 12 }} width={75} />
              <Tooltip
                contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
                formatter={v => [`$${v.toLocaleString()}`, '']}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {chartData.map((d, i) => (
                  <rect key={i} fill={d.fill} />
                ))}
              </Bar>
              <ReferenceLine x={income * 0.15} stroke="#facc15" strokeDasharray="4 2"
                label={{ value: '15% limit', fill: '#facc15', fontSize: 10, position: 'top' }} />
            </BarChart>
          </ResponsiveContainer>
          {remittanceHigh && (
            <p className="text-xs text-red-400 mt-3">
              Remittance is {remittancePct}% of income — above the 15% threshold linked to elevated stress.
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">Key figures</h2>
          <StatRow label="Monthly remittance" value={`$${remittance.toLocaleString()}`} />
          <StatRow label="Remittance as % of income" value={`${remittancePct}%`} highlight={remittanceHigh}
            note={remittanceHigh ? 'Above 15% sustainable threshold' : 'Within sustainable range'} />
          <StatRow label="Total debt" value={`$${debt.toLocaleString()}`} />
          <StatRow label="Debt-to-monthly-income ratio" value={`${debtToIncome}×`} highlight={debtHigh}
            note={debtHigh ? 'High — above 3× monthly income' : 'Manageable range'} />
          <StatRow label="Income stability" value={`${Math.round(stability * 100)}%`} />
        </div>

        {/* Cultural note */}
        <div className="bg-gray-900 rounded-2xl border border-yellow-900/50 p-5 mb-8">
          <p className="text-xs text-yellow-300/80 leading-relaxed">
            <span className="font-semibold">इज्जत (Izzat) note:</span> Remittance obligations are a deeply
            important part of family honor for Nepali diaspora. These figures are for awareness, not judgement.
            View resources for culturally-grounded guidance on sustainable limits.
          </p>
        </div>

        <button onClick={() => navigate(-1)} className="w-full py-3 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors text-sm">
          ← Back
        </button>

      </div>
    </div>
  )
}
