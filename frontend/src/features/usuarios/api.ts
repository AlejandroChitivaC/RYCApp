import { http } from '../../app/http/httpClient'
import type { Rol, Usuario, UsuarioCreate, UsuarioPendienteActivacion, UsuarioUpdate } from './types'

export const rolesApi = {
  list: async () => (await http.get<Rol[]>('/api/roles')).data,
}

export const usuariosApi = {
  list: async () => (await http.get<Usuario[]>('/api/usuarios')).data,
  listConductores: async () => (await http.get<Usuario[]>('/api/usuarios/conductores')).data,
  listPendientesActivacion: async () =>
    (await http.get<UsuarioPendienteActivacion[]>('/api/usuarios/pendientes-activacion')).data,
  activarCuenta: async (id: number) =>
    (await http.post<Usuario>(`/api/usuarios/${id}/activar`)).data,
  create: async (payload: UsuarioCreate) =>
    (await http.post<Usuario>('/api/usuarios', payload)).data,
  update: async (id: number, payload: UsuarioUpdate) =>
    (await http.put<Usuario>(`/api/usuarios/${id}`, payload)).data,
}
