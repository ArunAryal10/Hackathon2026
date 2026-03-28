export const STORAGE_KEYS = {
  USER: 'mannchill_user',
  PERMISSIONS: 'mannchill_permissions',
  WEIGHTS: 'mannchill_weights',
  SCORE_HISTORY: 'mannchill_score_history',
  LAST_SCORE: 'mannchill_last_score',
}

export const DEFAULT_PERMISSIONS = {
  hrv: true,
  sleep: true,
  financial: true,
  behavioral: true,
  selfReport: true,
}

const BASE_WEIGHTS = {
  hrv_sleep: 0.25,
  financial: 0.40,
  behavioral: 0.20,
  self_report: 0.15,
}

const PERMISSION_TO_WEIGHT = {
  hrv:        'hrv_sleep',
  sleep:      'hrv_sleep',   // hrv + sleep share the same subscorer
  financial:  'financial',
  behavioral: 'behavioral',
  selfReport: 'self_report',
}

export function computeWeights(permissions) {
  // Determine which weight keys are active
  // hrv_sleep is active if EITHER hrv or sleep is permitted
  const activeKeys = new Set()
  if (permissions.hrv || permissions.sleep)  activeKeys.add('hrv_sleep')
  if (permissions.financial)                 activeKeys.add('financial')
  if (permissions.behavioral)               activeKeys.add('behavioral')
  if (permissions.selfReport)               activeKeys.add('self_report')

  // Sum of active base weights
  const totalActive = [...activeKeys].reduce((sum, k) => sum + BASE_WEIGHTS[k], 0)

  // Normalise so weights always sum to 1
  const weights = {}
  for (const key of Object.keys(BASE_WEIGHTS)) {
    weights[key] = activeKeys.has(key)
      ? parseFloat((BASE_WEIGHTS[key] / totalActive).toFixed(4))
      : 0
  }

  return weights
}

export function getPermissions() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.PERMISSIONS)) || DEFAULT_PERMISSIONS }
  catch { return DEFAULT_PERMISSIONS }
}

export function getWeights() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.WEIGHTS)) || null }
  catch { return null }
}

export function getUser() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER)) || null }
  catch { return null }
}

export function isOnboarded() {
  return !!localStorage.getItem(STORAGE_KEYS.PERMISSIONS)
}

export function saveScoreToHistory(scoreResult) {
  const entry = { date: new Date().toISOString(), ...scoreResult }
  try {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.SCORE_HISTORY)) || []
    history.push(entry)
    // Keep last 30 entries
    if (history.length > 30) history.splice(0, history.length - 30)
    localStorage.setItem(STORAGE_KEYS.SCORE_HISTORY, JSON.stringify(history))
    localStorage.setItem(STORAGE_KEYS.LAST_SCORE, JSON.stringify(entry))
  } catch { /* ignore */ }
}

export function getScoreHistory() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.SCORE_HISTORY)) || [] }
  catch { return [] }
}

export function getLastScore() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.LAST_SCORE)) || null }
  catch { return null }
}

// Generate synthetic 7-day trend for first-time users
export function syntheticTrend(baseScore) {
  const today = new Date()
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (6 - i))
    const jitter = (Math.random() - 0.5) * 14
    return {
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: Math.round(Math.min(100, Math.max(0, baseScore + jitter))),
    }
  })
}
