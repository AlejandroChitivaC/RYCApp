import { create } from 'zustand'
import { getApiErrorMessage } from '../../app/http/apiError'
import { loading, notify } from '../../shared/notify/notiflix'
import { costosApi, tiposCostoApi } from './api'
import type { CostoCreate, CostoRegistro, TipoCosto, TipoCostoCreate, TipoCostoUpdate } from './types'

type TiposState = {
  items: TipoCosto[]
  isLoading: boolean
  error: string | null
  fetchAll: () => Promise<void>
  create: (payload: TipoCostoCreate) => Promise<TipoCosto>
  update: (id: string, payload: TipoCostoUpdate) => Promise<TipoCosto>
}

export const useTiposCostoStore = create<TiposState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  fetchAll: async () => {
    try {
      set({ isLoading: true, error: null })
      set({ items: await tiposCostoApi.list() })
    } catch (e) {
      set({ error: getApiErrorMessage(e) })
    } finally {
      set({ isLoading: false })
    }
  },

  create: async (payload) => {
    loading.show('Creando tipo de costo...')
    try {
      const created = await tiposCostoApi.create(payload)
      set({ items: [created, ...get().items] })
      notify.success('Tipo de costo creado.')
      return created
    } catch (e) {
      notify.failure(getApiErrorMessage(e))
      throw e
    } finally {
      loading.remove()
    }
  },

  update: async (id, payload) => {
    loading.show('Actualizando tipo de costo...')
    try {
      const updated = await tiposCostoApi.update(id, payload)
      set({ items: get().items.map((x) => (x.id === id ? updated : x)) })
      notify.success('Tipo de costo actualizado.')
      return updated
    } catch (e) {
      notify.failure(getApiErrorMessage(e))
      throw e
    } finally {
      loading.remove()
    }
  },
}))

type CostosState = {
  items: CostoRegistro[]
  isLoading: boolean
  error: string | null
  fetchAll: () => Promise<void>
  create: (payload: CostoCreate) => Promise<CostoRegistro>
}

export const useCostosStore = create<CostosState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  fetchAll: async () => {
    try {
      set({ isLoading: true, error: null })
      set({ items: await costosApi.list() })
    } catch (e) {
      set({ error: getApiErrorMessage(e) })
    } finally {
      set({ isLoading: false })
    }
  },

  create: async (payload) => {
    loading.show('Registrando costo...')
    try {
      const created = await costosApi.create(payload)
      set({ items: [created, ...get().items] })
      notify.success('Costo registrado.')
      return created
    } catch (e) {
      notify.failure(getApiErrorMessage(e))
      throw e
    } finally {
      loading.remove()
    }
  },
}))
