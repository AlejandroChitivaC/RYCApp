export function fmtDate(iso: string | null | undefined) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

/** Fecha ISO `yyyy-MM-dd` sin desfase de zona horaria. */
export function fmtDay(iso: string | null | undefined) {
  if (!iso) return '—'
  const day = iso.slice(0, 10)
  const [y, m, d] = day.split('-')
  if (!y || !m || !d) return iso
  return `${d}/${m}/${y}`
}

export function fmtMoneyCop(value: string | number | null | undefined) {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return '—'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(n)
}

export function fmtBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}
