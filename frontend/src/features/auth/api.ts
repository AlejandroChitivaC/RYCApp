import { http } from '../../app/http/httpClient'
import type { AuthLoginResponse, AuthUser } from './types'

export type RegistroPayload = {
  correo: string
  password: string
  cedula: string
  nombre: string
  apellido: string
}

export type MessageResponse = { message: string }

export const authApi = {
  login: async (correo: string, password: string) =>
    (await http.post<AuthLoginResponse>('/api/auth/login', { correo, password })).data,

  registro: async (payload: RegistroPayload) =>
    (await http.post<MessageResponse>('/api/auth/registro', payload)).data,

  verificarCorreo: async (correo: string, codigo: string) =>
    (await http.post<MessageResponse>('/api/auth/verificar-correo', { correo, codigo })).data,

  reenviarOtp: async (correo: string) =>
    (await http.post<MessageResponse>('/api/auth/reenviar-otp', { correo })).data,

  solicitarRecuperacion: async (correo: string) =>
    (await http.post<MessageResponse>('/api/auth/recuperacion/solicitar', { correo })).data,

  confirmarRecuperacion: async (payload: { correo: string; codigo: string; password: string }) =>
    (await http.post<MessageResponse>('/api/auth/recuperacion/confirmar', payload)).data,

  me: async () => (await http.get<AuthUser>('/api/auth/me')).data,
}
