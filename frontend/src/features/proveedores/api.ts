import { http } from '../../app/http/httpClient'
import type { Proveedor, ProveedorCreate, ProveedorUpdate } from './types'

export const proveedoresApi = {
  list: async () => (await http.get<Proveedor[]>('/api/proveedores')).data,
  create: async (payload: ProveedorCreate) =>
    (await http.post<Proveedor>('/api/proveedores', payload)).data,
  update: async (id: string, payload: ProveedorUpdate) =>
    (await http.put<Proveedor>(`/api/proveedores/${id}`, payload)).data,
  setEstado: async (id: string, estado: string) =>
    (await http.patch<Proveedor>(`/api/proveedores/${id}/estado`, { estado })).data,
}
