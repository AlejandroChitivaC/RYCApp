import { http } from '../../app/http/httpClient'
import type { Rol, Usuario, UsuarioCreate, UsuarioPendienteActivacion, UsuarioUpdate } from './types'

export const rolesApi = {
  list: async () => (await http.get<Rol[]>('/api/roles')).data,
}

export const usuariosApi = {
  list: async () => (await http.get<Usuario[]>('/api/usuarios')).data,
  listConductores: async () => (await http.get<Usuario[]>('/api/usuarios/conductores')).data,
  listEstadosEdicion: async () =>
    (await http.get<string[]>('/api/usuarios/catalogo/estados-edicion')).data,
  listRolesActivacionRegistro: async () =>
    (await http.get<Rol[]>('/api/usuarios/catalogo/roles-activacion-registro')).data,
  listPendientesActivacion: async () =>
    (await http.get<UsuarioPendienteActivacion[]>('/api/usuarios/pendientes-activacion')).data,
  activarCuenta: async (id: string, rolId: string) =>
    (await http.post<Usuario>(`/api/usuarios/${id}/activar`, { rolId })).data,
  create: async (payload: UsuarioCreate) =>
    (await http.post<Usuario>('/api/usuarios', payload)).data,
  update: async (id: string, payload: UsuarioUpdate) =>
    (await http.put<Usuario>(`/api/usuarios/${id}`, payload)).data,
}
