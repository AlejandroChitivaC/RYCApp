import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLayoutSearch } from '../../../app/shell/LayoutSearchContext'
import { esActivo } from '../../auth/roles'
import { useAuthStore } from '../../auth/store'
import { useUsuariosStore } from '../../usuarios/store'
import { useVehiculosStore } from '../../vehiculos/store'
import { Button } from '../../../shared/ui/Button'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { Modal } from '../../../shared/ui/Modal'
import { PageListToolbar } from '../../../shared/ui/PageListToolbar'
import { StatMiniCard } from '../../../shared/ui/StatMiniCard'
import { StatusBadge } from '../../../shared/ui/StatusBadge'
import { Table, TBody, TD, TH, THead } from '../../../shared/ui/Table'
import { fmtDateOnly, fmtMoneyCop } from '../../../shared/utils/format'
import { CostoForm } from '../components/CostoForm'
import { useCostosStore, useTiposCostoStore } from '../store'
import {
  CATEGORIAS_COSTO,
  labelCategoria,
  type CategoriaCosto,
  type CostoRegistro,
} from '../types'

function nombreUsuario(id: string | null, byId: Map<string, string>) {
  if (!id) return '—'
  return byId.get(id) ?? id
}

function matchesCosto(
  row: CostoRegistro,
  q: string,
  tipoById: Map<string, string>,
  usuarioById: Map<string, string>,
  vehiculoById: Map<string, string>,
) {
  const s = q.trim().toLowerCase()
  if (!s) return true
  const tipo = (tipoById.get(row.tipoCostoId) ?? '').toLowerCase()
  const debitado = nombreUsuario(row.usuarioDebitadoId, usuarioById).toLowerCase()
  const placa = (row.vehiculoId ? (vehiculoById.get(row.vehiculoId) ?? '') : '').toLowerCase()
  return (
    row.id.toLowerCase().includes(s) ||
    labelCategoria(row.categoria).toLowerCase().includes(s) ||
    tipo.includes(s) ||
    row.medioPago.toLowerCase().includes(s) ||
    String(row.valor).toLowerCase().includes(s) ||
    fmtDateOnly(row.fechaInsercion).toLowerCase().includes(s) ||
    (row.descripcion ?? '').toLowerCase().includes(s) ||
    (row.motivo ?? '').toLowerCase().includes(s) ||
    debitado.includes(s) ||
    placa.includes(s)
  )
}

export function CostosPage() {
  const items = useCostosStore((s) => s.items)
  const isLoading = useCostosStore((s) => s.isLoading)
  const error = useCostosStore((s) => s.error)
  const fetchCostos = useCostosStore((s) => s.fetchAll)
  const create = useCostosStore((s) => s.create)

  const tipos = useTiposCostoStore((s) => s.items)
  const fetchTipos = useTiposCostoStore((s) => s.fetchAll)

  const usuarios = useUsuariosStore((s) => s.items)
  const fetchUsuarios = useUsuariosStore((s) => s.fetchAll)
  const vehiculos = useVehiculosStore((s) => s.items)
  const fetchVehiculos = useVehiculosStore((s) => s.fetchAll)

  const authUser = useAuthStore((s) => s.user)
  const { query: layoutQuery } = useLayoutSearch()
  const [tableQuery, setTableQuery] = useState('')
  const [categoria, setCategoria] = useState<CategoriaCosto | 'TODAS'>('TODAS')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    fetchCostos()
    fetchTipos()
    fetchUsuarios()
    fetchVehiculos()
  }, [fetchCostos, fetchTipos, fetchUsuarios, fetchVehiculos])

  const usuarioById = useMemo(() => {
    const map = new Map<string, string>()
    for (const u of usuarios) map.set(u.id, `${u.nombre} ${u.apellido}`)
    return map
  }, [usuarios])

  const vehiculoById = useMemo(() => {
    const map = new Map<string, string>()
    for (const v of vehiculos) map.set(v.id, v.placa)
    return map
  }, [vehiculos])

  const tipoById = useMemo(() => {
    const map = new Map<string, string>()
    for (const t of tipos) map.set(t.id, t.tipoCosto)
    return map
  }, [tipos])

  const sorted = useMemo(
    () =>
      [...items].sort((a, b) => (b.fechaInsercion ?? '').localeCompare(a.fechaInsercion ?? '')),
    [items],
  )

  const filtered = useMemo(
    () =>
      sorted.filter(
        (row) =>
          (categoria === 'TODAS' || row.categoria === categoria) &&
          matchesCosto(row, layoutQuery, tipoById, usuarioById, vehiculoById) &&
          matchesCosto(row, tableQuery, tipoById, usuarioById, vehiculoById),
      ),
    [sorted, categoria, layoutQuery, tableQuery, tipoById, usuarioById, vehiculoById],
  )

  const totalValor = filtered.reduce((sum, row) => sum + Number(row.valor || 0), 0)
  const tiposActivos = tipos.filter((t) => esActivo(t.estado)).length

  const usuarioRegistroLabel = authUser
    ? `${authUser.nombre} ${authUser.apellido} · ${authUser.correo}`
    : '—'

  return (
    <div>
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatMiniCard
          label="Registros"
          value={filtered.length}
          icon={<span className="text-sm font-extrabold">$</span>}
        />
        <StatMiniCard
          label="Valor filtrado"
          value={fmtMoneyCop(totalValor)}
          icon={<span className="h-2.5 w-2.5 rounded-full bg-amber-500" />}
          iconBgClass="bg-amber-100 text-amber-900"
        />
        <StatMiniCard
          label="Tipos activos"
          value={tiposActivos}
          icon={<span className="h-2.5 w-2.5 rounded-full bg-brand-success" />}
          iconBgClass="bg-brand-success-soft text-emerald-800"
        />
      </div>

      <PageListToolbar
        title="Movimientos de costo"
        description="Nómina, gastos administrativos, costos de vehículo y financieros. Cada registro queda ligado a un tipo de costo."
        tableSearch={{ value: tableQuery, onChange: setTableQuery, placeholder: 'Buscar en tabla…' }}
        action={
          <Button className="rounded-xl px-5" onClick={() => setOpen(true)}>
            + Nuevo costo
          </Button>
        }
        extra={
          <Link
            to="/tipos-costo"
            className="inline-flex items-center rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-bold text-brand-dark shadow-sm hover:bg-zinc-50"
          >
            Tipos de costo
          </Link>
        }
      />

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategoria('TODAS')}
          className={chipClass(categoria === 'TODAS')}
        >
          Todas
        </button>
        {CATEGORIAS_COSTO.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => setCategoria(c.value)}
            className={chipClass(categoria === c.value)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="h-40 animate-pulse rounded-2xl bg-zinc-100" />
        ) : error ? (
          <EmptyState title="No se pudo cargar" description={error} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={sorted.length === 0 ? 'Aún no hay costos registrados' : 'Sin resultados'}
            description={
              sorted.length === 0
                ? 'Registra el primer movimiento. Si no hay tipos, créalos en el catálogo de tipos de costo.'
                : 'Ningún costo coincide con la búsqueda o la categoría seleccionada.'
            }
          />
        ) : (
          <>
            <Table>
              <THead>
                <tr>
                  <TH>Fecha</TH>
                  <TH>Categoría</TH>
                  <TH>Tipo</TH>
                  <TH>Valor</TH>
                  <TH>Medio de pago</TH>
                  <TH>Referencia</TH>
                </tr>
              </THead>
              <TBody>
                {filtered.map((row) => (
                  <tr key={`${row.categoria}-${row.id}`} className="hover:bg-brand-yellow/[0.06]">
                    <TD className="tabular-nums text-zinc-600">{fmtDateOnly(row.fechaInsercion)}</TD>
                    <TD>
                      <StatusBadge>{labelCategoria(row.categoria)}</StatusBadge>
                    </TD>
                    <TD className="font-semibold text-brand-dark">
                      {tipoById.get(row.tipoCostoId) ?? row.tipoCostoId}
                    </TD>
                    <TD className="tabular-nums font-semibold">{fmtMoneyCop(row.valor)}</TD>
                    <TD>{row.medioPago}</TD>
                    <TD className="text-brand-muted">
                      {row.categoria === 'NOMINA'
                        ? nombreUsuario(row.usuarioDebitadoId, usuarioById)
                        : row.categoria === 'VEHICULO'
                          ? (vehiculoById.get(row.vehiculoId ?? '') ?? row.vehiculoId ?? '—')
                          : (row.descripcion ?? '—')}
                    </TD>
                  </tr>
                ))}
              </TBody>
            </Table>
            <p className="mt-4 text-sm text-brand-muted">
              Mostrando <span className="font-bold text-brand-dark">{filtered.length}</span> de{' '}
              <span className="font-bold text-brand-dark">{sorted.length}</span> costos
            </p>
          </>
        )}
      </div>

      <Modal open={open} title="Nuevo costo" onClose={() => setOpen(false)}>
        <CostoForm
          categoriaInicial={categoria === 'TODAS' ? null : categoria}
          tipos={tipos}
          usuarios={usuarios}
          vehiculos={vehiculos}
          usuarioRegistroId={authUser?.id ?? ''}
          usuarioRegistroLabel={usuarioRegistroLabel}
          onCancel={() => setOpen(false)}
          onSubmit={async (payload) => {
            await create(payload)
            setOpen(false)
          }}
        />
      </Modal>
    </div>
  )
}

function chipClass(active: boolean) {
  return [
    'rounded-full px-3 py-1.5 text-xs font-bold transition',
    active
      ? 'bg-brand-dark text-brand-yellow'
      : 'border border-zinc-200 bg-white text-brand-dark hover:bg-zinc-50',
  ].join(' ')
}
