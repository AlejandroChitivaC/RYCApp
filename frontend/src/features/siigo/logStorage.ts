import type { SiigoLogEntry } from '../types'

const STORAGE_KEY = 'rycapp.siigo.activityLog'
const MAX_ENTRIES = 40

export function loadSiigoLogs(): SiigoLogEntry[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as SiigoLogEntry[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveSiigoLogs(entries: SiigoLogEntry[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)))
  } catch {
    // sessionStorage lleno o no disponible: se ignora
  }
}

export function clearSiigoLogs() {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

export function createSiigoLogEntry(
  partial: Omit<SiigoLogEntry, 'id' | 'at'>,
): SiigoLogEntry {
  return {
    ...partial,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    at: new Date().toISOString(),
  }
}
