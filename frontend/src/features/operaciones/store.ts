import { create } from 'zustand'
import { getApiErrorMessage } from '../../app/http/apiError'
import { loading, notify } from '../../shared/notify/notiflix'
import { isoEndOfDay, isoStartOfDay } from '../../shared/utils/format'
import { operacionesApi } from './api'
import type { Operacion, OperacionCreate } from './types'

type Filters = {
  from: string
  to: string
  lineaNegocioId: string
  vehiculoId: string
}

type State = {
  items: Operacion[]
  isLoading: boolean
  error: string | null
  filters: Filters
  setFilters: (patch: Partial<Filters>) => void
  fetchAll: () => Promise<void>
  create: (payload: OperacionCreate) => Promise<Operacion>
  confirmar: (id: string) => Promise<Operacion>
}

export const useOperacionesStore = create<State>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,
  filters: { from: '', to: '', lineaNegocioId: '', vehiculoId: '' },
  setFilters: (patch) => set({ filters: { ...get().filters, ...patch } }),

  fetchAll: async () => {
    try {
      set({ isLoading: true, error: null })
      const f = get().filters
      const params = {
        from: f.from ? isoStartOfDay(f.from) : undefined,
        to: f.to ? isoEndOfDay(f.to) : undefined,
        lineaNegocioId: f.lineaNegocioId || undefined,
        vehiculoId: f.vehiculoId || undefined,
      }
      set({ items: await operacionesApi.list(params) })
    } catch (e) {
      set({ error: getApiErrorMessage(e) })
    } finally {
      set({ isLoading: false })
    }
  },

  create: async (payload) => {
    loading.show('Registrando operación...')
    try {
      const created = await operacionesApi.create(payload)
      set({ items: [created, ...get().items] })
      notify.success('Operación registrada.')
      return created
    } catch (e) {
      notify.failure(getApiErrorMessage(e))
      throw e
    } finally {
      loading.remove()
    }
  },

  confirmar: async (id) => {
    loading.show('Confirmando operación...')
    try {
      const updated = await operacionesApi.confirmar(id)
      set({ items: get().items.map((x) => (x.id === id ? { ...x, ...updated } : x)) })
      notify.success('Operación confirmada. Ya puede sincronizarse con Siigo.')
      return updated
    } catch (e) {
      notify.failure(getApiErrorMessage(e))
      throw e
    } finally {
      loading.remove()
    }
  },
}))
