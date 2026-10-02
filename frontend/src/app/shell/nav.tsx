import type { ReactElement } from 'react'
import {
  ROLES_ADMIN,
  ROLES_ADMIN_CONTADOR,
  ROLES_SIIGO,
  ROLES_TICKETS,
} from '../../features/auth/roles'
import {
  IconBriefcase,
  IconBuilding,
  IconCoins,
  IconCube,
  IconGrid,
  IconHistory,
  IconPlug,
  IconReceipt,
  IconTags,
  IconTicket,
  IconTruck,
  IconUsers,
} from './navIcons'

export type NavItem = {
  to: string
  label: string
  description?: string
  icon: (props: { className?: string }) => ReactElement
  roles?: readonly string[]
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: IconGrid, roles: ROLES_ADMIN_CONTADOR },
  { to: '/lineas-negocio', label: 'Líneas de negocio', icon: IconBriefcase, roles: ROLES_ADMIN },
  { to: '/usuarios', label: 'Usuarios', icon: IconUsers, roles: ROLES_ADMIN },
  { to: '/materiales', label: 'Materiales', icon: IconCube, roles: ROLES_ADMIN },
  { to: '/proveedores', label: 'Proveedores', icon: IconBuilding, roles: ROLES_ADMIN },
  { to: '/vehiculos', label: 'Vehículos', icon: IconTruck, roles: ROLES_ADMIN },
  { to: '/costos', label: 'Costos', icon: IconCoins, roles: ROLES_ADMIN_CONTADOR },
  { to: '/tipos-costo', label: 'Tipos de costo', icon: IconTags, roles: ROLES_ADMIN },
  { to: '/operaciones', label: 'Operaciones', icon: IconReceipt, roles: ROLES_ADMIN_CONTADOR },
  {
    to: '/historial-operaciones',
    label: 'Historial de operaciones',
    icon: IconHistory,
    roles: ROLES_ADMIN_CONTADOR,
  },
  { to: '/tickets', label: 'Tickets', icon: IconTicket, roles: ROLES_TICKETS },
  { to: '/siigo', label: 'Siigo', icon: IconPlug, roles: ROLES_SIIGO },
]
