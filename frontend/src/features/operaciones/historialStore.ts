import { create } from 'zustand'
import { getApiErrorMessage } from '../../app/http/apiError'
import { operacionesApi } from './api'
import type { Operacion } from './types'

type HistorialFilters = {
  from: string
  to: string
  lineaNegocioId: string
  proveedorId: string
}

type State = {
  items: Operacion[]
  isLoading: boolean
  error: string | null
  filters: HistorialFilters
  setFilters: (patch: Partial<HistorialFilters>) => void
  fetchHistorial: () => Promise<void>
}

export const useHistorialOperacionesStore = create<State>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,
  filters: { from: '', to: '', lineaNegocioId: '', proveedorId: '' },
  setFilters: (patch) => set({ filters: { ...get().filters, ...patch } }),

  fetchHistorial: async () => {
    try {
      set({ isLoading: true, error: null })
      const f = get().filters
      const params = {
        from: f.from ? new Date(f.from).toISOString() : undefined,
        to: f.to ? new Date(f.to).toISOString() : undefined,
        lineaNegocioId: f.lineaNegocioId ? Number(f.lineaNegocioId) : undefined,
        proveedorId: f.proveedorId ? Number(f.proveedorId) : undefined,
      }
      set({ items: await operacionesApi.historial(params) })
    } catch (e) {
      set({ error: getApiErrorMessage(e) })
    } finally {
      set({ isLoading: false })
    }
  },
}))
