import { http } from '../../app/http/httpClient'
import type { Ticket, TicketAuditoria } from './types'

export const ticketsApi = {
  list: async (params?: { operacionId?: number }) =>
    (await http.get<Ticket[]>('/api/tickets', { params })).data,

  get: async (id: number) =>
    (await http.get<Ticket>(`/api/tickets/${id}`)).data,

  obtenerPdfBlob: async (id: number, disposition: 'inline' | 'attachment' = 'attachment') =>
    (
      await http.get<Blob>(`/api/tickets/${id}/pdf`, {
        params: { disposition },
        responseType: 'blob',
      })
    ).data,

  cargar: async (formData: FormData) =>
    (await http.post<Ticket>('/api/tickets', formData)).data,

  descargarPdf: async (id: number, nombreArchivo: string) => {
    const blob = await ticketsApi.obtenerPdfBlob(id, 'attachment')
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = nombreArchivo.replace(/\.[^.]+$/, '') + '.pdf'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  },

  auditoria: async () =>
    (await http.get<TicketAuditoria[]>('/api/tickets/auditoria')).data,

  auditoriaPorTicket: async (ticketId: number) =>
    (await http.get<TicketAuditoria[]>(`/api/tickets/${ticketId}/auditoria`)).data,
}
