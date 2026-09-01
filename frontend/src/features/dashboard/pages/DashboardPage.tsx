import { useEffect, useMemo, useState } from 'react'
import { getApiErrorMessage } from '../../../app/http/apiError'
import { Button } from '../../../shared/ui/Button'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { Input } from '../../../shared/ui/Input'
import { Select } from '../../../shared/ui/Select'
import { StatMiniCard } from '../../../shared/ui/StatMiniCard'
import { fmtMoneyCop } from '../../../shared/utils/format'
import { lineasNegocioApi } from '../../lineasNegocio/api'
import type { LineaNegocio } from '../../lineasNegocio/types'
import { proveedoresApi } from '../../proveedores/api'
import type { Proveedor } from '../../proveedores/types'
import { reportesApi } from '../api'
import { BarChart, LineChart } from '../components/ReportCharts'
import type { ReporteDashboard } from '../types'

type Filters = {
  from: string
  to: string
  lineaNegocioId: string
  proveedorId: string
}

function isoStart(date: string) {
  return new Date(`${date}T00:00:00`).toISOString()
}

function isoEnd(date: string) {
  return new Date(`${date}T23:59:59.999`).toISOString()
}

function defaultRange(): Filters {
  const to = new Date()
  const from = new Date()
  from.setMonth(from.getMonth() - 5)
  from.setDate(1)
  const pad = (n: number) => String(n).padStart(2, '0')
  const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  return { from: fmt(from), to: fmt(to), lineaNegocioId: '', proveedorId: '' }
}

function monthLabel(periodo: string) {
  const [y, m] = periodo.split('-')
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  const idx = Number(m) - 1
  if (!y || idx < 0 || idx > 11) return periodo
  return `${months[idx]} ${y.slice(2)}`
}

function IconOps() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
      <path
        d="M7 3h10a2 2 0 0 1 2 2v16l-2-1-2 1-2-1-2 1-2-1-2 1V5a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M9 8h6M9 12h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function IconMoney() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
      <path d="M4 7h16v10H4V7Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function IconCost() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 4h7l9 9-7 7-9-9V4Z" strokeLinejoin="round" />
      <path d="M7.5 7.5h.01" strokeLinecap="round" />
    </svg>
  )
}

function IconProfit() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
      <path d="M4 16 10 10l4 4 6-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function DashboardPage() {
  const [filters, setFilters] = useState<Filters>(defaultRange)
  const [applied, setApplied] = useState<Filters>(defaultRange)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [report, setReport] = useState<ReporteDashboard | null>(null)
  const [lineas, setLineas] = useState<LineaNegocio[]>([])
  const [proveedores, setProveedores] = useState<Proveedor[]>([])

  useEffect(() => {
    void lineasNegocioApi.list().then(setLineas).catch(() => setLineas([]))
    void proveedoresApi.list().then(setProveedores).catch(() => setProveedores([]))
  }, [])

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await reportesApi.dashboard({
          from: applied.from ? isoStart(applied.from) : undefined,
          to: applied.to ? isoEnd(applied.to) : undefined,
          lineaNegocioId: applied.lineaNegocioId ? Number(applied.lineaNegocioId) : undefined,
          proveedorId: applied.proveedorId ? Number(applied.proveedorId) : undefined,
        })
        if (!active) return
        setReport(data)
      } catch (e) {
        if (!active) return
        setError(getApiErrorMessage(e))
        setReport(null)
      } finally {
        if (!active) return
        setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [applied])

  const utilidadNum = Number(report?.utilidad ?? 0)
  const serie = report?.serieMensual ?? []
  const porLinea = report?.porLinea ?? []

  const opsBars = useMemo(
    () => serie.map((s) => ({ label: monthLabel(s.periodo), value: s.operaciones })),
    [serie],
  )
  const lineaBars = useMemo(
    () =>
      porLinea.slice(0, 8).map((s) => ({
        label: s.lineaNegocio.length > 12 ? `${s.lineaNegocio.slice(0, 11)}…` : s.lineaNegocio,
        value: Number(s.ingresos),
      })),
    [porLinea],
  )
  const financeLines = useMemo(
    () => [
      {
        name: 'Ingresos',
        color: '#16a34a',
        points: serie.map((s) => ({ label: monthLabel(s.periodo), value: Number(s.ingresos) })),
      },
      {
        name: 'Costos',
        color: '#dc2626',
        points: serie.map((s) => ({ label: monthLabel(s.periodo), value: Number(s.costos) })),
      },
    ],
    [serie],
  )

  return (
    <div>
      <div className="rounded-2xl border border-zinc-200/90 bg-gradient-to-br from-white via-brand-yellow-soft/40 to-white p-5 shadow-sm sm:p-6">
        <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-brand-yellow">
          R&amp;C Transportes
        </div>
        <h2 className="mt-1 text-xl font-extrabold tracking-tight text-brand-dark sm:text-2xl">
          Reportes
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-brand-muted">
          Indicadores operativos y financieros del periodo. Filtra por fecha, línea de negocio o
          cliente.
        </p>
      </div>

      <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <Input
              label="Desde"
              type="date"
              value={filters.from}
              onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
            />
          </div>
          <div className="lg:col-span-3">
            <Input
              label="Hasta"
              type="date"
              value={filters.to}
              onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
            />
          </div>
          <div className="lg:col-span-3">
            <Select
              label="Línea de negocio"
              value={filters.lineaNegocioId}
              onChange={(e) => setFilters((f) => ({ ...f, lineaNegocioId: e.target.value }))}
            >
              <option value="">Todas</option>
              {lineas.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.lineaNegocio}
                </option>
              ))}
            </Select>
          </div>
          <div className="lg:col-span-3">
            <Select
              label="Cliente"
              value={filters.proveedorId}
              onChange={(e) => setFilters((f) => ({ ...f, proveedorId: e.target.value }))}
            >
              <option value="">Todos</option>
              {proveedores.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            size="sm"
            className="rounded-xl"
            onClick={() => setApplied({ ...filters })}
            loading={loading}
          >
            Aplicar filtros
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="rounded-xl border-zinc-200"
            onClick={() => {
              const next = defaultRange()
              setFilters(next)
              setApplied(next)
            }}
          >
            Últimos 6 meses
          </Button>
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          Los ingresos se filtran por línea y cliente. Los costos (nómina, administrativos, vehículo y
          financieros) se filtran solo por fecha.
        </p>
      </div>

      {error ? (
        <div className="mt-6">
          <EmptyState title="No se pudo cargar el reporte" description={error} />
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatMiniCard
              icon={<IconOps />}
              label="Operaciones del periodo"
              value={loading ? '—' : (report?.operaciones ?? 0)}
              iconBgClass="bg-brand-yellow/25 text-brand-dark"
            />
            <StatMiniCard
              icon={<IconMoney />}
              label="Ingresos"
              value={loading ? '—' : fmtMoneyCop(report?.ingresos)}
              iconBgClass="bg-emerald-100 text-emerald-900"
            />
            <StatMiniCard
              icon={<IconCost />}
              label="Costos"
              value={loading ? '—' : fmtMoneyCop(report?.costos)}
              iconBgClass="bg-amber-100 text-amber-900"
            />
            <StatMiniCard
              icon={<IconProfit />}
              label="Utilidad"
              value={loading ? '—' : fmtMoneyCop(report?.utilidad)}
              iconBgClass={
                utilidadNum >= 0
                  ? 'bg-emerald-100 text-emerald-900'
                  : 'bg-red-50 text-red-800'
              }
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="text-sm font-extrabold text-brand-dark">Operaciones por mes</div>
              <p className="mt-0.5 text-xs text-zinc-500">Volumen operativo del periodo filtrado.</p>
              {loading ? (
                <div className="mt-4 h-56 animate-pulse rounded-xl bg-zinc-100" />
              ) : opsBars.every((p) => p.value === 0) ? (
                <p className="mt-8 text-sm text-zinc-500">No hay operaciones en este periodo.</p>
              ) : (
                <BarChart points={opsBars} />
              )}
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-extrabold text-brand-dark">Ingresos vs costos</div>
                  <p className="mt-0.5 text-xs text-zinc-500">Tendencia mensual en pesos.</p>
                </div>
                <div className="flex gap-3 text-[11px] font-bold">
                  <span className="text-emerald-700">● Ingresos</span>
                  <span className="text-red-600">● Costos</span>
                </div>
              </div>
              {loading ? (
                <div className="mt-4 h-56 animate-pulse rounded-xl bg-zinc-100" />
              ) : serie.length === 0 ? (
                <p className="mt-8 text-sm text-zinc-500">Sin datos para graficar.</p>
              ) : (
                <LineChart series={financeLines} />
              )}
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-extrabold text-brand-dark">Ingresos por línea de negocio</div>
            <p className="mt-0.5 text-xs text-zinc-500">Comparativo de facturación operativa.</p>
            {loading ? (
              <div className="mt-4 h-56 animate-pulse rounded-xl bg-zinc-100" />
            ) : lineaBars.length === 0 ? (
              <p className="mt-8 text-sm text-zinc-500">No hay ingresos por línea en este periodo.</p>
            ) : (
              <BarChart points={lineaBars} valueFormatter={fmtMoneyCop} barClass="fill-brand-dark" />
            )}
          </div>
        </>
      )}
    </div>
  )
}
