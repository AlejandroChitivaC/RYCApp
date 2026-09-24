import { http } from '../../app/http/httpClient'
import type { Ticket, TicketAuditoria } from './types'

type TicketPdfLink = {
  url: string
  nombreArchivo: string
}

export const ticketsApi = {
  list: async (params?: { operacionId?: string }) =>
    (await http.get<Ticket[]>('/api/tickets', { params })).data,

  get: async (id: string) =>
    (await http.get<Ticket>(`/api/tickets/${id}`)).data,

  obtenerPdf: async (id: string, disposition: 'inline' | 'attachment' = 'attachment') =>
    (await http.get<TicketPdfLink>(`/api/tickets/${id}/pdf`, { params: { disposition } })).data,

  cargar: async (formData: FormData) =>
    (await http.post<Ticket>('/api/tickets', formData)).data,

  descargarPdf: async (id: string, nombreArchivo: string) => {
    const { url, nombreArchivo: nombre } = await ticketsApi.obtenerPdf(id, 'attachment')
    const a = document.createElement('a')
    a.href = url
    a.download = (nombreArchivo || nombre).replace(/\.[^.]+$/, '') + '.pdf'
    a.target = '_blank'
    a.rel = 'noreferrer'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  },

  auditoria: async () =>
    (await http.get<TicketAuditoria[]>('/api/tickets/auditoria')).data,

  auditoriaPorTicket: async (ticketId: string) =>
    (await http.get<TicketAuditoria[]>(`/api/tickets/${ticketId}/auditoria`)).data,
}
