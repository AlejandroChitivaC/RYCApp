import { create } from 'zustand'
import { getApiErrorMessage } from '../../app/http/apiError'
import { loading, notify } from '../../shared/notify/notiflix'
import { materialesApi } from './api'
import type { Material, MaterialCreate, MaterialUpdate } from './types'

type State = {
  items: Material[]
  isLoading: boolean
  error: string | null
  fetchAll: () => Promise<void>
  create: (payload: MaterialCreate) => Promise<Material>
  update: (id: number, payload: MaterialUpdate) => Promise<Material>
}

export const useMaterialesStore = create<State>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  fetchAll: async () => {
    try {
      set({ isLoading: true, error: null })
      set({ items: await materialesApi.list() })
    } catch (e) {
      set({ error: getApiErrorMessage(e) })
    } finally {
      set({ isLoading: false })
    }
  },

  create: async (payload) => {
    loading.show('Creando material...')
    try {
      const created = await materialesApi.create(payload)
      set({ items: [created, ...get().items] })
      notify.success('Material creado.')
      return created
    } catch (e) {
      notify.failure(getApiErrorMessage(e))
      throw e
    } finally {
      loading.remove()
    }
  },

  update: async (id, payload) => {
    loading.show('Actualizando material...')
    try {
      const updated = await materialesApi.update(id, payload)
      set({ items: get().items.map((x) => (x.id === id ? updated : x)) })
      notify.success('Material actualizado.')
      return updated
    } catch (e) {
      notify.failure(getApiErrorMessage(e))
      throw e
    } finally {
      loading.remove()
    }
  },
}))
