const ROLES_HISTORIAL = ['Administrador', 'Contador'] as const

export function hasRole(rol: string | undefined | null, roles: readonly string[]) {
  if (!rol) return false
  return roles.includes(rol)
}

export function esAdministrador(rol: string | undefined | null) {
  return rol === 'Administrador'
}

export function esActivo(estado: string | undefined | null) {
  return String(estado ?? '').toUpperCase() === 'ACTIVO'
}

export function puedeConsultarHistorial(rol: string | undefined | null) {
  return hasRole(rol, ROLES_HISTORIAL)
}

export const ROLES_CONSULTA_HISTORIAL = ROLES_HISTORIAL

export const ROLES_TICKETS_CARGA = ['Administrador', 'Conductor'] as const
export const ROLES_TICKETS_CONSULTA = ['Administrador', 'Contador'] as const
export const ROLES_TICKETS_AUDITORIA = ['Administrador'] as const

export const ROLES_SIIGO = ['Administrador', 'Contador'] as const
