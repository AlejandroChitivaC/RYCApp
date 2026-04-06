/** Debe coincidir con PasswordPolicy del backend (mín. 8, número, carácter especial). */
export const PASSWORD_MIN_LENGTH = 8

export function passwordHasMinLength(p: string): boolean {
  return p.length >= PASSWORD_MIN_LENGTH
}

export function passwordHasDigit(p: string): boolean {
  return /\d/.test(p)
}

export function passwordHasSpecial(p: string): boolean {
  return /[^A-Za-z0-9]/.test(p)
}

export function passwordMeetsPolicy(p: string): boolean {
  return passwordHasMinLength(p) && passwordHasDigit(p) && passwordHasSpecial(p)
}

export type PasswordStrengthLevel = 'weak' | 'fair' | 'good' | 'strong'

export type PasswordStrength = {
  percent: number
  level: PasswordStrengthLevel
  labelEs: string
}

const LEVELS: Record<PasswordStrengthLevel, { labelEs: string; minPercent: number }> = {
  weak: { labelEs: 'Débil', minPercent: 0 },
  fair: { labelEs: 'Regular', minPercent: 25 },
  good: { labelEs: 'Buena', minPercent: 50 },
  strong: { labelEs: 'Fuerte', minPercent: 75 },
}

function levelFromPercent(percent: number): PasswordStrengthLevel {
  if (percent >= 75) return 'strong'
  if (percent >= 50) return 'good'
  if (percent >= 25) return 'fair'
  return 'weak'
}

/** Barra visual 0–100 (independiente del cumplimiento mínimo; la política exige los 3 requisitos). */
export function getPasswordStrength(p: string): PasswordStrength {
  if (!p) {
    return { percent: 0, level: 'weak', labelEs: LEVELS.weak.labelEs }
  }
  let score = 0
  if (passwordHasMinLength(p)) score += 28
  if (passwordHasDigit(p)) score += 28
  if (passwordHasSpecial(p)) score += 28
  if (p.length >= 12) score += 8
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score += 8
  const percent = Math.min(100, score)
  const level = levelFromPercent(percent)
  return { percent, level, labelEs: LEVELS[level].labelEs }
}

export function strengthBarColor(level: PasswordStrengthLevel): string {
  switch (level) {
    case 'weak':
      return '#ef4444'
    case 'fair':
      return '#f97316'
    case 'good':
      return '#eab308'
    case 'strong':
      return '#22c55e'
    default:
      return '#71717a'
  }
}

export function strengthBorderClass(level: PasswordStrengthLevel): string {
  switch (level) {
    case 'weak':
      return 'border-red-500 ring-1 ring-red-500/30'
    case 'fair':
      return 'border-orange-500 ring-1 ring-orange-500/30'
    case 'good':
      return 'border-yellow-500 ring-1 ring-yellow-500/30'
    case 'strong':
      return 'border-emerald-500 ring-1 ring-emerald-500/40'
    default:
      return 'border-zinc-600'
  }
}
