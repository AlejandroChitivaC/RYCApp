import { NavLink } from 'react-router-dom'
import { APP_NAME } from '../config'
import { NAV_ITEMS } from './nav'
import logoUrl from '../../assets/logo.png'
import { useAuthStore } from '../../features/auth/store'
import { useMaterialesStore } from '../../features/materiales/store'
import { useUsuariosStore } from '../../features/usuarios/store'
import { useVehiculosStore } from '../../features/vehiculos/store'
import { useProveedoresStore } from '../../features/proveedores/store'
import { useLineasNegocioStore } from '../../features/lineasNegocio/store'
import { useOperacionesStore } from '../../features/operaciones/store'
import { useHistorialOperacionesStore } from '../../features/operaciones/historialStore'
import { useTicketsStore } from '../../features/tickets/store'
import { useCostosStore, useTiposCostoStore } from '../../features/costos/store'

function initials(nombre: string, apellido: string) {
  const a = (nombre || '').trim().charAt(0)
  const b = (apellido || '').trim().charAt(0)
  return (a + b).toUpperCase() || 'U'
}

function IconGear({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" strokeLinejoin="round" />
      <path
        d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.05.05a2 2 0 1 1-2.83 2.83l-.05-.05A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.44 1.26V22a2 2 0 1 1-4 0v-.74a1.7 1.7 0 0 0-.44-1.26 1.7 1.7 0 0 0-1-.6 1.7 1.7 0 0 0-1.87.34l-.05.05a2 2 0 1 1-2.83-2.83l.05-.05A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.26-.44H2a2 2 0 1 1 0-4h.74a1.7 1.7 0 0 0 1.26-.44 1.7 1.7 0 0 0 .6-1 1.7 1.7 0 0 0-.34-1.87l-.05-.05a2 2 0 1 1 2.83-2.83l.05.05A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .44-1.26V2a2 2 0 1 1 4 0v.74a1.7 1.7 0 0 0 .44 1.26 1.7 1.7 0 0 0 1 .6 1.7 1.7 0 0 0 1.87-.34l.05-.05a2 2 0 1 1 2.83 2.83l-.05.05A1.7 1.7 0 0 0 19.4 9c0 .37.22.72.6 1s.88.44 1.26.44H22a2 2 0 1 1 0 4h-.74a1.7 1.7 0 0 0-1.26.44 1.7 1.7 0 0 0-.6 1Z"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function useNavCounts(): Record<string, number> {
  const materiales = useMaterialesStore((s) => s.items.length)
  const usuarios = useUsuariosStore((s) => s.items.length)
  const vehiculos = useVehiculosStore((s) => s.items.length)
  const proveedores = useProveedoresStore((s) => s.items.length)
  const lineas = useLineasNegocioStore((s) => s.items.length)
  const operaciones = useOperacionesStore((s) => s.items.length)
  const historial = useHistorialOperacionesStore((s) => s.items.length)
  const tickets = useTicketsStore((s) => s.items.length)
  const costos = useCostosStore((s) => s.items.length)
  const tiposCosto = useTiposCostoStore((s) => s.items.length)
  return {
    '/materiales': materiales,
    '/usuarios': usuarios,
    '/vehiculos': vehiculos,
    '/proveedores': proveedores,
    '/lineas-negocio': lineas,
    '/costos': costos,
    '/tipos-costo': tiposCosto,
    '/operaciones': operaciones,
    '/historial-operaciones': historial,
    '/tickets': tickets,
  }
}

export function Sidebar() {
  const user = useAuthStore((s) => s.user)
  const counts = useNavCounts()

  const visibleNavItems = NAV_ITEMS.filter(
    (item) => !item.roles || (user?.rol != null && item.roles.includes(user.rol)),
  )

  return (
    <div className="flex min-h-0 w-full flex-col overflow-hidden bg-brand-sidebar lg:h-full">
      <div className="shrink-0 border-b border-white/10 p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-brand-yellow shadow-md ring-2 ring-brand-yellow/40">
            <img src={logoUrl} alt="" className="h-8 w-8 object-contain" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-extrabold tracking-tight text-white">R&amp;C Transportes</div>
            <div className="truncate text-[11px] text-zinc-500">{APP_NAME}</div>
          </div>
        </div>
      </div>

      <nav className="scrollbar-none flex-1 space-y-0.5 overflow-y-auto overflow-x-hidden p-2">
        {visibleNavItems.map((item) => (
          <NavItemLink key={item.to} item={item} count={counts[item.to]} />
        ))}
      </nav>

      <div className="shrink-0 border-t border-white/10 p-3">
        {user ? (
          <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-3 py-3 ring-1 ring-white/10">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-yellow text-sm font-extrabold text-brand-dark shadow-md">
              {initials(user.nombre, user.apellido)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-bold text-white">
                {user.nombre} {user.apellido}
              </div>
              <div className="truncate text-xs text-zinc-400">{user.rol}</div>
            </div>
            <button
              type="button"
              className="shrink-0 rounded-lg p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white"
              aria-label="Ajustes"
            >
              <IconGear className="h-5 w-5" />
            </button>
          </div>
        ) : null}
        <div className="mt-3 px-1 text-center text-[10px] leading-snug text-zinc-600">
          <span className="text-brand-yellow/80">R&amp;C © {new Date().getFullYear()}</span>
        </div>
      </div>
    </div>
  )
}

function NavItemLink({
  item,
  count,
}: {
  item: (typeof NAV_ITEMS)[number]
  count?: number
}) {
  const showBadge = count != null && count > 0

  return (
    <NavLink to={item.to} className="mb-0.5 block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow/60">
      {({ isActive }) => (
        <span
          className={[
            'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition',
            isActive
              ? 'bg-brand-yellow font-bold text-brand-dark shadow-[0_0_0_1px_rgba(245,184,0,0.5),0_0_20px_rgba(245,184,0,0.25)]'
              : 'text-zinc-300 hover:bg-white/5 hover:text-white',
          ].join(' ')}
        >
          <span
            className={[
              'grid h-9 w-9 shrink-0 place-items-center rounded-lg transition',
              isActive ? 'bg-brand-dark text-brand-yellow' : 'bg-white/10 text-brand-yellow',
            ].join(' ')}
          >
            <item.icon className="h-[18px] w-[18px]" />
          </span>
          <span className="font-semibold">{item.label}</span>
          {showBadge ? (
            <span
              className={[
                'ml-auto grid h-6 min-w-[1.5rem] place-items-center rounded-full px-1.5 text-[11px] font-extrabold tabular-nums',
                isActive ? 'bg-brand-dark text-brand-yellow' : 'bg-white/15 text-white',
              ].join(' ')}
            >
              {count! > 99 ? '99+' : count}
            </span>
          ) : (
            <span className="ml-auto w-6 shrink-0" aria-hidden />
          )}
        </span>
      )}
    </NavLink>
  )
}
