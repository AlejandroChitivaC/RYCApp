const ROL_ADMIN = 'Administrador'
const ROL_CONTADOR = 'Contador'
const ROL_CONDUCTOR = 'Conductor'

export function hasRole(rol: string | undefined | null, roles: readonly string[]) {
  if (!rol) return false
  return roles.includes(rol)
}

export function esAdministrador(rol: string | undefined | null) {
  return rol === ROL_ADMIN
}

export function esActivo(estado: string | undefined | null) {
  return String(estado ?? '').toUpperCase() === 'ACTIVO'
}

export const ROLES_ADMIN = [ROL_ADMIN] as const
export const ROLES_ADMIN_CONTADOR = [ROL_ADMIN, ROL_CONTADOR] as const
export const ROLES_TICKETS = [ROL_ADMIN, ROL_CONTADOR, ROL_CONDUCTOR] as const

/** Tabs permitidos (además el Administrador ve todo). */
export const RUTAS_CONTADOR = [
  '/dashboard',
  '/costos',
  '/operaciones',
  '/historial-operaciones',
  '/tickets',
  '/siigo',
] as const

export const RUTAS_CONDUCTOR = ['/tickets'] as const

export function homePathForRole(rol: string | undefined | null): string {
  if (rol === ROL_CONDUCTOR) return '/tickets'
  return '/dashboard'
}

export function puedeAccederRuta(rol: string | undefined | null, path: string): boolean {
  if (!rol) return false
  if (rol === ROL_ADMIN) return true
  const allowed = rol === ROL_CONTADOR ? RUTAS_CONTADOR : rol === ROL_CONDUCTOR ? RUTAS_CONDUCTOR : []
  const pathname = path.split('?')[0] || '/'
  return allowed.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

export function puedeConsultarHistorial(rol: string | undefined | null) {
  return hasRole(rol, ROLES_ADMIN_CONTADOR)
}

export const ROLES_CONSULTA_HISTORIAL = ROLES_ADMIN_CONTADOR

export const ROLES_TICKETS_CARGA = [ROL_ADMIN, ROL_CONDUCTOR] as const
export const ROLES_TICKETS_CONSULTA = ROLES_TICKETS
export const ROLES_TICKETS_AUDITORIA = ROLES_ADMIN

export const ROLES_SIIGO = ROLES_ADMIN_CONTADOR
