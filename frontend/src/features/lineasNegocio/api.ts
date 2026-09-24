import { http } from '../../app/http/httpClient'
import type { LineaNegocio, LineaNegocioCreate, LineaNegocioUpdate } from './types'

export const lineasNegocioApi = {
  list: async () => (await http.get<LineaNegocio[]>('/api/lineas-negocio')).data,
  get: async (id: string) =>
    (await http.get<LineaNegocio>(`/api/lineas-negocio/${id}`)).data,
  create: async (payload: LineaNegocioCreate) =>
    (await http.post<LineaNegocio>('/api/lineas-negocio', payload)).data,
  update: async (id: string, payload: LineaNegocioUpdate) =>
    (await http.put<LineaNegocio>(`/api/lineas-negocio/${id}`, payload)).data,
  setEstado: async (id: string, estado: string) =>
    (await http.patch<LineaNegocio>(`/api/lineas-negocio/${id}/estado`, { estado })).data,
}
