import { http } from '../../app/http/httpClient'
import type { Vehiculo, VehiculoCreate, VehiculoUpdate } from './types'

export const vehiculosApi = {
  list: async () => (await http.get<Vehiculo[]>('/api/vehiculos')).data,
  create: async (payload: VehiculoCreate) =>
    (await http.post<Vehiculo>('/api/vehiculos', payload)).data,
  update: async (id: number, payload: VehiculoUpdate) =>
    (await http.put<Vehiculo>(`/api/vehiculos/${id}`, payload)).data,
}

