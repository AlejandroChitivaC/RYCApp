import { create } from 'zustand'
import { getApiErrorMessage } from '../../app/http/apiError'
import { loading, notify } from '../../shared/notify/notiflix'
import { rolesApi, usuariosApi } from './api'
import type { Rol, Usuario, UsuarioCreate, UsuarioPendienteActivacion, UsuarioUpdate } from './types'

type State = {
  items: Usuario[]
  roles: Rol[]
  conductores: Usuario[]
  pendientesActivacion: UsuarioPendienteActivacion[]
  isLoading: boolean
  error: string | null
  fetchAll: () => Promise<void>
  fetchRoles: () => Promise<void>
  fetchConductores: () => Promise<void>
  fetchPendientesActivacion: () => Promise<void>
  activarCuenta: (id: number) => Promise<void>
  create: (payload: UsuarioCreate) => Promise<Usuario>
  update: (id: number, payload: UsuarioUpdate) => Promise<Usuario>
}

export const useUsuariosStore = create<State>((set, get) => ({
  items: [],
  roles: [],
  conductores: [],
  pendientesActivacion: [],
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

  fetchConductores: async () => {
    try {
      set({ conductores: await usuariosApi.listConductores() })
    } catch {
      set({ conductores: [] })
    }
  },

  fetchPendientesActivacion: async () => {
    try {
      set({ pendientesActivacion: await usuariosApi.listPendientesActivacion() })
    } catch {
      set({ pendientesActivacion: [] })
    }
  },

  activarCuenta: async (id) => {
    loading.show('Activando cuenta...')
    try {
      const updated = await usuariosApi.activarCuenta(id)
      set({
        items: get().items.map((x) => (x.id === id ? updated : x)),
        pendientesActivacion: get().pendientesActivacion.filter((p) => p.id !== id),
      })
      notify.success('Cuenta activada. Se notificó al usuario por correo.')
    } catch (e) {
      notify.failure(getApiErrorMessage(e))
      throw e
    } finally {
      loading.remove()
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
