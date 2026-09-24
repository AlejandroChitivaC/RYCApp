import { http } from '../../app/http/httpClient'
import type { Material, MaterialCreate, MaterialUpdate } from './types'

export const materialesApi = {
  list: async () => (await http.get<Material[]>('/api/materiales')).data,
  create: async (payload: MaterialCreate) =>
    (await http.post<Material>('/api/materiales', payload)).data,
  update: async (id: string, payload: MaterialUpdate) =>
    (await http.put<Material>(`/api/materiales/${id}`, payload)).data,
}
