import { create } from 'zustand'
import { getApiErrorMessage } from '../../app/http/apiError'
import { loading, notify } from '../../shared/notify/notiflix'
import { vehiculosApi } from './api'
import type { Vehiculo, VehiculoCreate, VehiculoUpdate } from './types'

type State = {
  items: Vehiculo[]
  isLoading: boolean
  error: string | null
  fetchAll: () => Promise<void>
  create: (payload: VehiculoCreate) => Promise<Vehiculo>
  update: (id: number, payload: VehiculoUpdate) => Promise<Vehiculo>
  setEstado: (id: number, estado: string) => Promise<Vehiculo>
}

export const useVehiculosStore = create<State>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  fetchAll: async () => {
    try {
      set({ isLoading: true, error: null })
      set({ items: await vehiculosApi.list() })
    } catch (e) {
      set({ error: getApiErrorMessage(e) })
    } finally {
      set({ isLoading: false })
    }
  },

  create: async (payload) => {
    loading.show('Creando vehículo...')
    try {
      const created = await vehiculosApi.create(payload)
      set({ items: [created, ...get().items] })
      notify.success('Vehículo creado.')
      return created
    } catch (e) {
      notify.failure(getApiErrorMessage(e))
      throw e
    } finally {
      loading.remove()
    }
  },

  update: async (id, payload) => {
    loading.show('Actualizando vehículo...')
    try {
      const updated = await vehiculosApi.update(id, payload)
      set({ items: get().items.map((x) => (x.id === id ? updated : x)) })
      notify.success('Vehículo actualizado.')
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
      const updated = await vehiculosApi.setEstado(id, estado)
      set({ items: get().items.map((x) => (x.id === id ? updated : x)) })
      notify.success(
        updated.estado.toUpperCase() === 'INACTIVO'
          ? 'Vehículo desactivado. El conductor quedó libre.'
          : 'Vehículo activado.',
      )
      return updated
    } catch (e) {
      notify.failure(getApiErrorMessage(e))
      throw e
    } finally {
      loading.remove()
    }
  },
}))

