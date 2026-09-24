import { create } from 'zustand'
import { getApiErrorMessage } from '../../app/http/apiError'
import { loading, notify } from '../../shared/notify/notiflix'
import { proveedoresApi } from './api'
import type { Proveedor, ProveedorCreate, ProveedorUpdate } from './types'

type State = {
  items: Proveedor[]
  isLoading: boolean
  error: string | null
  fetchAll: () => Promise<void>
  create: (payload: ProveedorCreate) => Promise<Proveedor>
  update: (id: string, payload: ProveedorUpdate) => Promise<Proveedor>
  setEstado: (id: string, estado: string) => Promise<Proveedor>
}

export const useProveedoresStore = create<State>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  fetchAll: async () => {
    try {
      set({ isLoading: true, error: null })
      set({ items: await proveedoresApi.list() })
    } catch (e) {
      set({ error: getApiErrorMessage(e) })
    } finally {
      set({ isLoading: false })
    }
  },

  create: async (payload) => {
    loading.show('Creando proveedor...')
    try {
      const created = await proveedoresApi.create(payload)
      set({ items: [created, ...get().items] })
      notify.success('Proveedor creado.')
      return created
    } catch (e) {
      notify.failure(getApiErrorMessage(e))
      throw e
    } finally {
      loading.remove()
    }
  },

  update: async (id, payload) => {
    loading.show('Actualizando proveedor...')
    try {
      const updated = await proveedoresApi.update(id, payload)
      set({ items: get().items.map((x) => (x.id === id ? updated : x)) })
      notify.success('Proveedor actualizado.')
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
      const updated = await proveedoresApi.setEstado(id, estado)
      set({ items: get().items.map((x) => (x.id === id ? updated : x)) })
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
