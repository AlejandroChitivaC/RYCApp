import { http } from '../../app/http/httpClient'
import type { Operacion, OperacionCreate } from './types'

export const operacionesApi = {
  list: async (params?: {
    from?: string
    to?: string
    lineaNegocioId?: number
    vehiculoId?: number
    proveedorId?: number
  }) =>
    (
      await http.get<Operacion[]>('/api/operaciones', {
        params,
      })
    ).data,
  historial: async (params?: {
    from?: string
    to?: string
    lineaNegocioId?: number
    proveedorId?: number
  }) =>
    (
      await http.get<Operacion[]>('/api/operaciones/historial', {
        params,
      })
    ).data,
  get: async (id: number) =>
    (await http.get<Operacion>(`/api/operaciones/${id}`)).data,
  create: async (payload: OperacionCreate) =>
    (await http.post<Operacion>('/api/operaciones', payload)).data,
}
