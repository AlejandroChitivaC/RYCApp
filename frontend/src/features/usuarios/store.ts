import { create } from 'zustand'
import { getApiErrorMessage } from '../../app/http/apiError'
import { loading, notify } from '../../shared/notify/notiflix'
import { rolesApi, usuariosApi } from './api'
import type { Rol, Usuario, UsuarioCreate, UsuarioUpdate } from './types'

type State = {
  items: Usuario[]
  roles: Rol[]
  isLoading: boolean
  error: string | null
  fetchAll: () => Promise<void>
  fetchRoles: () => Promise<void>
  create: (payload: UsuarioCreate) => Promise<Usuario>
  update: (id: number, payload: UsuarioUpdate) => Promise<Usuario>
}

export const useUsuariosStore = create<State>((set, get) => ({
  items: [],
  roles: [],
  isLoading: false,
  error: null,

  fetchRoles: async () => {
    try {
      set({ roles: await rolesApi.list() })
    } catch {
      /* ignore en listado principal */
    }
  },

  fetchAll: async () => {
    try {
      set({ isLoading: true, error: null })
      const [items, roles] = await Promise.all([usuariosApi.list(), rolesApi.list()])
      set({ items, roles })
    } catch (e) {
      set({ error: getApiErrorMessage(e) })
    } finally {
      set({ isLoading: false })
    }
  },

  create: async (payload) => {
    loading.show('Creando usuario...')
    try {
      const created = await usuariosApi.create(payload)
      set({ items: [created, ...get().items] })
      notify.success('Usuario creado.')
      return created
    } catch (e) {
      notify.failure(getApiErrorMessage(e))
      throw e
    } finally {
      loading.remove()
    }
  },

  update: async (id, payload) => {
    loading.show('Actualizando usuario...')
    try {
      const updated = await usuariosApi.update(id, payload)
      set({ items: get().items.map((x) => (x.id === id ? updated : x)) })
      notify.success('Usuario actualizado.')
      return updated
    } catch (e) {
      notify.failure(getApiErrorMessage(e))
      throw e
    } finally {
      loading.remove()
    }
  },
}))
