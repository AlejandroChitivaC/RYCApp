import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { http } from '../../../app/http/httpClient'
import { getApiErrorMessage } from '../../../app/http/apiError'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { StatMiniCard } from '../../../shared/ui/StatMiniCard'

type Stat = {
  label: string
  value: number
  icon: ReactNode
  iconBgClass: string
}

async function safeCount<T>(path: string): Promise<number> {
  const res = await http.get<T[]>(path)
  return Array.isArray(res.data) ? res.data.length : 0
}

function IconBriefcase({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M9 6a3 3 0 0 1 6 0v1h3a2 2 0 0 1 2 2v3.5a2.5 2.5 0 0 1-2 2.45V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2.05A2.5 2.5 0 0 1 2 12.5V9a2 2 0 0 1 2-2h3V6Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M9 7V6a3 3 0 0 1 6 0v1" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function IconUsers({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path d="M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 20a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function IconTruck({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path d="M3 7h11v10H3V7Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M14 10h4l3 3v4h-7V10Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path
        d="M7 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM18 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  )
}

function IconCube({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M12 3 4 7v10l8 4 8-4V7l-8-4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="m4 7 8 4 8-4M12 11v10" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function IconBuilding({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M4 21V8l8-4v17M4 21h16M12 21V12m0 0h8v9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconReceipt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M7 3h10a2 2 0 0 1 2 2v16l-2-1-2 1-2-1-2 1-2-1-2 1V5a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M9 8h6M9 12h6M9 16h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function IconTag({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 4h7l9 9-7 7-9-9V4Z" strokeLinejoin="round" />
      <path d="M7.5 7.5h.01" strokeLinecap="round" />
    </svg>
  )
}

export function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [counts, setCounts] = useState({
    lineas: 0,
    usuarios: 0,
    vehiculos: 0,
    materiales: 0,
    proveedores: 0,
    operaciones: 0,
    tiposCosto: 0,
  })

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const [lineas, usuarios, vehiculos, materiales, proveedores, operaciones, tiposCosto] =
          await Promise.all([
            safeCount('/api/lineas-negocio'),
            safeCount('/api/usuarios'),
            safeCount('/api/vehiculos'),
            safeCount('/api/materiales'),
            safeCount('/api/proveedores'),
            safeCount('/api/operaciones'),
            safeCount('/api/tipos-costo'),
          ])
        if (!active) return
        setCounts({
          lineas,
          usuarios,
          vehiculos,
          materiales,
          proveedores,
          operaciones,
          tiposCosto,
        })
      } catch (e) {
        if (!active) return
        setError(getApiErrorMessage(e))
      } finally {
        if (!active) return
        setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const stats = useMemo<Stat[]>(
    () => [
      {
        label: 'Líneas de negocio',
        value: counts.lineas,
        icon: <IconBriefcase className="h-6 w-6" />,
        iconBgClass: 'bg-brand-yellow/20 text-brand-dark',
      },
      {
        label: 'Usuarios',
        value: counts.usuarios,
        icon: <IconUsers className="h-6 w-6" />,
        iconBgClass: 'bg-zinc-200 text-brand-dark',
      },
      {
        label: 'Vehículos',
        value: counts.vehiculos,
        icon: <IconTruck className="h-6 w-6" />,
        iconBgClass: 'bg-amber-100 text-amber-900',
      },
      {
        label: 'Materiales',
        value: counts.materiales,
        icon: <IconCube className="h-6 w-6" />,
        iconBgClass: 'bg-brand-yellow/15 text-brand-dark',
      },
      {
        label: 'Proveedores',
        value: counts.proveedores,
        icon: <IconBuilding className="h-6 w-6" />,
        iconBgClass: 'bg-zinc-100 text-zinc-700',
      },
      {
        label: 'Operaciones',
        value: counts.operaciones,
        icon: <IconReceipt className="h-6 w-6" />,
        iconBgClass: 'bg-brand-yellow/25 text-brand-dark',
      },
      {
        label: 'Tipos de costo',
        value: counts.tiposCosto,
        icon: <IconTag className="h-6 w-6" />,
        iconBgClass: 'bg-emerald-100 text-emerald-900',
      },
    ],
    [counts],
  )

  return (
    <div>
      <div className="rounded-2xl border border-zinc-200/90 bg-gradient-to-br from-white via-brand-yellow-soft/40 to-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-brand-yellow">
              R&amp;C Transportes
            </div>
            <h2 className="mt-1 text-xl font-extrabold tracking-tight text-brand-dark sm:text-2xl">
              Resumen operativo
            </h2>
            <p className="mt-1 max-w-xl text-sm text-brand-muted">
              Vista rápida de volúmenes por entidad del modelo: catálogos y operaciones.
            </p>
          </div>
          <div className="rounded-full bg-brand-yellow-soft px-4 py-2 text-xs font-bold text-amber-900 ring-1 ring-amber-200/60">
            {loading ? 'Cargando…' : 'Datos al día'}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {stats.map((s) => (
          <StatMiniCard
            key={s.label}
            icon={s.icon}
            label={s.label}
            value={loading ? '—' : s.value}
            iconBgClass={s.iconBgClass}
          />
        ))}
      </div>

      {error ? (
        <div className="mt-6">
          <EmptyState title="No se pudo cargar el dashboard" description={error} />
        </div>
      ) : null}
    </div>
  )
}
