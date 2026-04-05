import { NavLink } from 'react-router-dom'
import { APP_NAME } from '../config'
import { NAV_ITEMS } from './nav'
import logoUrl from '../../assets/logo.png'

export function Sidebar() {
  return (
    <div className="flex min-h-0 w-full flex-col overflow-hidden bg-brand-dark-deep lg:h-full">
      <div className="shrink-0 border-b border-white/10 p-3 sm:p-4">
        <div className="flex flex-col gap-3">
          <div className="flex justify-center rounded-2xl bg-white/5 px-3 py-3 ring-1 ring-white/10 sm:px-4 sm:py-4">
            <img
              src={logoUrl}
              alt={`${APP_NAME} logo`}
              className="mx-auto h-16 w-auto max-w-[min(100%,280px)] object-contain object-center sm:h-[4.5rem] lg:h-20 lg:max-w-[min(100%,300px)]"
            />
          </div>
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="min-w-0">
              <div className="truncate text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-yellow">
                Módulo 1
              </div>
              <div className="truncate text-xs text-zinc-400">
                ER: catálogos, operaciones y costos (API)
              </div>
            </div>
            <div className="shrink-0 rounded-full bg-brand-yellow px-2 py-1 text-[10px] font-bold text-brand-dark-deep">
              v1
            </div>
          </div>
        </div>
      </div>

      <nav className="scrollbar-none flex-1 space-y-1 overflow-y-auto overflow-x-hidden p-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                'group relative mb-1 flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition',
                isActive ? 'active' : '',
                isActive
                  ? 'bg-brand-yellow text-brand-dark shadow-brand'
                  : 'text-zinc-300 hover:bg-white/5 hover:text-white',
              ]
                .filter(Boolean)
                .join(' ')
            }
          >
            <span
              className={[
                'grid h-9 w-9 place-items-center rounded-xl shadow-sm ring-1 transition',
                'bg-white/10 text-brand-yellow ring-white/10',
                'group-[.active]:bg-brand-dark group-[.active]:text-brand-yellow group-[.active]:ring-brand-yellow/40',
              ].join(' ')}
            >
              <item.icon className="h-5 w-5" />
            </span>
            <span className="font-semibold">{item.label}</span>
            <span className="ml-auto h-2 w-2 rounded-full bg-zinc-600 opacity-0 transition group-[.active]:bg-brand-dark group-[.active]:opacity-100" />
          </NavLink>
        ))}
      </nav>

      <div className="shrink-0 border-t border-white/10 p-3 sm:p-4">
        <div className="text-[11px] text-zinc-500">
          <span className="text-zinc-400">API</span>{' '}
          <span className="font-semibold text-zinc-300">Spring Boot</span>
          <span className="mx-2 text-zinc-600">·</span>
          <span className="text-brand-yellow/90">R&amp;C</span>
        </div>
      </div>
    </div>
  )
}
