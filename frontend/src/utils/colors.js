export const STRESS_COLORS = {
  low:      '#4ade80',
  moderate: '#facc15',
  high:     '#fb923c',
  severe:   '#f87171',
}

export function scoreColor(v) {
  if (v <= 25) return STRESS_COLORS.low
  if (v <= 50) return STRESS_COLORS.moderate
  if (v <= 75) return STRESS_COLORS.high
  return STRESS_COLORS.severe
}
