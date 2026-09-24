import { create } from 'zustand'
import { getApiErrorMessage } from '../../app/http/apiError'
import { loading, notify } from '../../shared/notify/notiflix'
import { isoEndOfDay, isoStartOfDay } from '../../shared/utils/format'
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
  confirmar: (id: string) => Promise<void>
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
        from: f.from ? isoStartOfDay(f.from) : undefined,
        to: f.to ? isoEndOfDay(f.to) : undefined,
        lineaNegocioId: f.lineaNegocioId || undefined,
        proveedorId: f.proveedorId || undefined,
      }
      set({ items: await operacionesApi.historial(params) })
    } catch (e) {
      set({ error: getApiErrorMessage(e) })
    } finally {
      set({ isLoading: false })
    }
  },

  confirmar: async (id) => {
    loading.show('Confirmando operación...')
    try {
      const updated = await operacionesApi.confirmar(id)
      set({ items: get().items.map((x) => (x.id === id ? { ...x, ...updated } : x)) })
      notify.success('Operación confirmada. Ya puede sincronizarse con Siigo.')
    } catch (e) {
      notify.failure(getApiErrorMessage(e))
      throw e
    } finally {
      loading.remove()
    }
  },
}))
