import { create } from 'zustand'
import { getApiErrorMessage } from '../../app/http/apiError'
import { loading, notify } from '../../shared/notify/notiflix'
import { ticketsApi } from './api'
import type { Ticket, TicketAuditoria } from './types'

type State = {
  items: Ticket[]
  auditoria: TicketAuditoria[]
  isLoading: boolean
  isLoadingAuditoria: boolean
  error: string | null
  filterOperacionId: string
  setFilterOperacionId: (id: string) => void
  fetchAll: () => Promise<void>
  fetchAuditoria: () => Promise<void>
  cargar: (formData: FormData) => Promise<Ticket>
  descargarPdf: (id: string, nombreArchivo: string) => Promise<void>
}

export const useTicketsStore = create<State>((set, get) => ({
  items: [],
  auditoria: [],
  isLoading: false,
  isLoadingAuditoria: false,
  error: null,
  filterOperacionId: '',

  setFilterOperacionId: (id) => set({ filterOperacionId: id }),

  fetchAll: async () => {
    try {
      set({ isLoading: true, error: null })
      const f = get().filterOperacionId
      const params = f ? { operacionId: f } : undefined
      set({ items: await ticketsApi.list(params) })
    } catch (e) {
      set({ error: getApiErrorMessage(e) })
    } finally {
      set({ isLoading: false })
    }
  },

  fetchAuditoria: async () => {
    try {
      set({ isLoadingAuditoria: true })
      set({ auditoria: await ticketsApi.auditoria() })
    } catch {
      // el backend rechazará con 403 si el rol no es ADMIN; se ignora silenciosamente
    } finally {
      set({ isLoadingAuditoria: false })
    }
  },

  cargar: async (formData) => {
    loading.show('Cargando ticket...')
    try {
      const created = await ticketsApi.cargar(formData)
      set({ items: [created, ...get().items] })
      notify.success('Ticket cargado correctamente.')
      return created
    } catch (e) {
      notify.failure(getApiErrorMessage(e))
      throw e
    } finally {
      loading.remove()
    }
  },

  descargarPdf: async (id, nombreArchivo) => {
    loading.show('Descargando PDF...')
    try {
      await ticketsApi.descargarPdf(id, nombreArchivo)
      notify.success('PDF descargado.')
    } catch (e) {
      notify.failure(getApiErrorMessage(e))
    } finally {
      loading.remove()
    }
  },
}))
