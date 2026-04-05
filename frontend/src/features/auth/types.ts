export type AuthUser = {
  id: number
  correo: string
  nombre: string
  apellido: string
  rol: string
}

export type AuthLoginResponse = {
  accessToken: string
  tokenType: string
  expiresInMinutes: number
  usuario: AuthUser
}
