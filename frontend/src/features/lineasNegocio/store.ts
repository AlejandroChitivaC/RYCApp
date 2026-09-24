import { create } from 'zustand'
import { getApiErrorMessage } from '../../app/http/apiError'
import { loading, notify } from '../../shared/notify/notiflix'
import { lineasNegocioApi } from './api'
import type { LineaNegocio, LineaNegocioCreate, LineaNegocioUpdate } from './types'

type State = {
  items: LineaNegocio[]
  isLoading: boolean
  error: string | null
  fetchAll: () => Promise<void>
  create: (payload: LineaNegocioCreate) => Promise<LineaNegocio>
  update: (id: string, payload: LineaNegocioUpdate) => Promise<LineaNegocio>
  setEstado: (id: string, estado: string) => Promise<LineaNegocio>
}

export const useLineasNegocioStore = create<State>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  fetchAll: async () => {
    try {
      set({ isLoading: true, error: null })
      const data = await lineasNegocioApi.list()
      set({ items: data })
    } catch (e) {
      set({ error: getApiErrorMessage(e) })
    } finally {
      set({ isLoading: false })
    }
  },

  create: async (payload) => {
    loading.show('Creando línea de negocio...')
    try {
      const created = await lineasNegocioApi.create(payload)
      set({ items: [created, ...get().items] })
      notify.success('Línea de negocio creada.')
      return created
    } catch (e) {
      notify.failure(getApiErrorMessage(e))
      throw e
    } finally {
      loading.remove()
    }
  },

  update: async (id, payload) => {
    loading.show('Actualizando línea de negocio...')
    try {
      const updated = await lineasNegocioApi.update(id, payload)
      set({
        items: get().items.map((x) => (x.id === id ? updated : x)),
      })
      notify.success('Línea de negocio actualizada.')
      return updated
    } catch (e) {
      notify.failure(getApiErrorMessage(e))
      throw e
    } finally {
      loading.remove()
    }
  },

  setEstado: async (id, estado) => {
    loading.show('Actualizando estado...')
    try {
      const updated = await lineasNegocioApi.setEstado(id, estado)
      set({
        items: get().items.map((x) => (x.id === id ? updated : x)),
      })
      notify.success('Estado actualizado.')
      return updated
    } catch (e) {
      notify.failure(getApiErrorMessage(e))
      throw e
    } finally {
      loading.remove()
    }
  },
}))
