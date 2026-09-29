import type { ReactElement } from 'react'
import {
  ROLES_CONSULTA_HISTORIAL,
  ROLES_SIIGO,
  ROLES_TICKETS_CARGA,
  ROLES_TICKETS_CONSULTA,
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
  { to: '/dashboard', label: 'Dashboard', icon: IconGrid },
  { to: '/lineas-negocio', label: 'Líneas de negocio', icon: IconBriefcase },
  { to: '/usuarios', label: 'Usuarios', icon: IconUsers },
  { to: '/materiales', label: 'Materiales', icon: IconCube },
  { to: '/proveedores', label: 'Proveedores', icon: IconBuilding },
  { to: '/vehiculos', label: 'Vehículos', icon: IconTruck },
  { to: '/costos', label: 'Costos', icon: IconCoins },
  { to: '/tipos-costo', label: 'Tipos de costo', icon: IconTags },
  { to: '/operaciones', label: 'Operaciones', icon: IconReceipt },
  {
    to: '/historial-operaciones',
    label: 'Historial de operaciones',
    icon: IconHistory,
    roles: ROLES_CONSULTA_HISTORIAL,
  },
  {
    to: '/tickets',
    label: 'Tickets',
    icon: IconTicket,
    roles: [...ROLES_TICKETS_CARGA, ...ROLES_TICKETS_CONSULTA],
  },
  {
    to: '/siigo',
    label: 'Siigo',
    icon: IconPlug,
    roles: ROLES_SIIGO,
  },
]
