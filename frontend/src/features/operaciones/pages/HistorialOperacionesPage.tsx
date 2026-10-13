import { useEffect, useMemo, useState } from 'react'
import { useLayoutSearch } from '../../../app/shell/LayoutSearchContext'
import { Button } from '../../../shared/ui/Button'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { Input } from '../../../shared/ui/Input'
import { PageListToolbar } from '../../../shared/ui/PageListToolbar'
import { Select } from '../../../shared/ui/Select'
import { StatusBadge } from '../../../shared/ui/StatusBadge'
import { Table, TBody, TD, TH, THead } from '../../../shared/ui/Table'
import { useCostosStore, useTiposCostoStore } from '../../costos/store'
import { CATEGORIAS_COSTO, labelCategoria } from '../../costos/types'
import { useLineasNegocioStore } from '../../lineasNegocio/store'
import { useMaterialesStore } from '../../materiales/store'
import { useProveedoresStore } from '../../proveedores/store'
import { useVehiculosStore } from '../../vehiculos/store'
import { AsignarFacturaModal } from '../components/AsignarFacturaModal'
import { useHistorialOperacionesStore } from '../historialStore'
import type { Operacion } from '../types'
import { fmtDateOnly, fmtMoneyCop } from '../../../shared/utils/format'

function fechaEnRango(iso: string | null | undefined, from: string, to: string) {
  const d = (iso ?? '').slice(0, 10)
  if (!d) return true
  if (from && d < from) return false
  if (to && d > to) return false
  return true
}

function matchesHistorial(
  o: Operacion,
  q: string,
  lineasById: Map<string, string>,
  proveedoresById: Map<string, string>,
  materialesById: Map<string, string>,
  vehiculosById: Map<string, string>,
) {
  const s = q.trim().toLowerCase()
  if (!s) return true
  const linea = (lineasById.get(o.lineaNegocioId) ?? '').toLowerCase()
  const proveedor = (proveedoresById.get(o.proveedorId) ?? '').toLowerCase()
  const material = (materialesById.get(o.materialId) ?? '').toLowerCase()
  const vehiculo = (vehiculosById.get(o.vehiculoId) ?? '').toLowerCase()
  return (
    String(o.id).includes(s) ||
    fmtDateOnly(o.fechaInsercion).toLowerCase().includes(s) ||
    linea.includes(s) ||
    proveedor.includes(s) ||
    material.includes(s) ||
    vehiculo.includes(s) ||
    String(o.valor).toLowerCase().includes(s) ||
    String(o.medioPago).toLowerCase().includes(s) ||
    (o.descripcion ?? '').toLowerCase().includes(s)
  )
}

export function HistorialOperacionesPage() {
  const items = useHistorialOperacionesStore((s) => s.items)
  const isLoading = useHistorialOperacionesStore((s) => s.isLoading)
  const error = useHistorialOperacionesStore((s) => s.error)
  const filters = useHistorialOperacionesStore((s) => s.filters)
  const setFilters = useHistorialOperacionesStore((s) => s.setFilters)
  const fetchHistorial = useHistorialOperacionesStore((s) => s.fetchHistorial)
  const confirmar = useHistorialOperacionesStore((s) => s.confirmar)
  const asignarFactura = useHistorialOperacionesStore((s) => s.asignarFactura)

  const lineasItems = useLineasNegocioStore((s) => s.items)
  const fetchLineas = useLineasNegocioStore((s) => s.fetchAll)

  const proveedoresItems = useProveedoresStore((s) => s.items)
  const fetchProveedores = useProveedoresStore((s) => s.fetchAll)

  const materialesItems = useMaterialesStore((s) => s.items)
  const fetchMateriales = useMaterialesStore((s) => s.fetchAll)

  const vehiculosItems = useVehiculosStore((s) => s.items)
  const fetchVehiculos = useVehiculosStore((s) => s.fetchAll)

  const costosItems = useCostosStore((s) => s.items)
  const costosLoading = useCostosStore((s) => s.isLoading)
  const costosError = useCostosStore((s) => s.error)
  const fetchCostos = useCostosStore((s) => s.fetchAll)

  const tiposCosto = useTiposCostoStore((s) => s.items)
  const fetchTiposCosto = useTiposCostoStore((s) => s.fetchAll)

  const { query: layoutQuery } = useLayoutSearch()
  const [tableQuery, setTableQuery] = useState('')
  const [asignarId, setAsignarId] = useState<string | null>(null)
  const [categoriaCosto, setCategoriaCosto] = useState('')
  const [tipoCostoId, setTipoCostoId] = useState('')

  useEffect(() => {
    fetchLineas()
    fetchProveedores()
    fetchMateriales()
    fetchVehiculos()
    fetchHistorial()
    fetchCostos()
    fetchTiposCosto()
  }, [
    fetchLineas,
    fetchProveedores,
    fetchMateriales,
    fetchVehiculos,
    fetchHistorial,
    fetchCostos,
    fetchTiposCosto,
  ])

  const lineasById = useMemo(() => {
    const map = new Map<string, string>()
    for (const l of lineasItems) map.set(l.id, l.lineaNegocio)
    return map
  }, [lineasItems])

  const proveedoresById = useMemo(() => {
    const map = new Map<string, string>()
    for (const p of proveedoresItems) map.set(p.id, p.nombre)
    return map
  }, [proveedoresItems])

  const materialesById = useMemo(() => {
    const map = new Map<string, string>()
    for (const m of materialesItems) map.set(m.id, m.material)
    return map
  }, [materialesItems])

  const vehiculosById = useMemo(() => {
    const map = new Map<string, string>()
    for (const v of vehiculosItems) map.set(v.id, v.placa)
    return map
  }, [vehiculosItems])

  const filteredOps = useMemo(
    () =>
      items.filter(
        (o) =>
          matchesHistorial(
            o,
            layoutQuery,
            lineasById,
            proveedoresById,
            materialesById,
            vehiculosById,
          ) &&
          matchesHistorial(
            o,
            tableQuery,
            lineasById,
            proveedoresById,
            materialesById,
            vehiculosById,
          ),
      ),
    [
      items,
      layoutQuery,
      tableQuery,
      lineasById,
      proveedoresById,
      materialesById,
      vehiculosById,
    ],
  )

  const tiposById = useMemo(() => {
    const map = new Map<string, string>()
    for (const t of tiposCosto) map.set(t.id, t.tipoCosto)
    return map
  }, [tiposCosto])

  const tiposFiltrados = useMemo(
    () => (categoriaCosto ? tiposCosto.filter((t) => t.flujo === categoriaCosto) : tiposCosto),
    [tiposCosto, categoriaCosto],
  )

  const filteredCostos = useMemo(
    () =>
      costosItems.filter((row) => {
        if (!fechaEnRango(row.fechaInsercion, filters.from, filters.to)) return false
        if (categoriaCosto && row.categoria !== categoriaCosto) return false
        if (tipoCostoId && row.tipoCostoId !== tipoCostoId) return false
        return true
      }),
    [costosItems, filters.from, filters.to, categoriaCosto, tipoCostoId],
  )

  return (
    <div>
      <PageListToolbar
        title="Historial de ventas"
        description="Consulta de ventas registradas. Al confirmar una venta puedes asignarle una factura de Siigo."
        tableSearch={{ value: tableQuery, onChange: setTableQuery }}
      />

      <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <Input
            label="Desde"
            type="date"
            value={filters.from}
            onChange={(e) => setFilters({ from: e.target.value })}
          />
        </div>
        <div className="lg:col-span-3">
          <Input
            label="Hasta"
            type="date"
            value={filters.to}
            onChange={(e) => setFilters({ to: e.target.value })}
          />
        </div>
        <div className="lg:col-span-3">
          <Select
            label="Línea de negocio"
            value={filters.lineaNegocioId}
            onChange={(e) => setFilters({ lineaNegocioId: e.target.value })}
          >
            <option value="">Todas</option>
            {lineasItems.map((l) => (
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
            onChange={(e) => setFilters({ proveedorId: e.target.value })}
          >
            <option value="">Todos</option>
            {proveedoresItems.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </Select>
        </div>

        <div className="lg:col-span-12 flex flex-wrap items-end gap-2">
          <Button
            variant="secondary"
            className="rounded-xl border-zinc-200"
            onClick={() => fetchHistorial()}
            loading={isLoading}
            size="sm"
          >
            Aplicar filtros
          </Button>
          <Button
            variant="secondary"
            className="rounded-xl border-zinc-200"
            onClick={() => {
              setFilters({ from: '', to: '', lineaNegocioId: '', proveedorId: '' })
              setCategoriaCosto('')
              setTipoCostoId('')
              setTimeout(() => fetchHistorial(), 0)
            }}
            size="sm"
          >
            Limpiar
          </Button>
        </div>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="h-40 w-full animate-pulse rounded-2xl bg-zinc-100" />
        ) : error ? (
          <EmptyState title="No se pudo cargar" description={error} />
        ) : items.length === 0 ? (
          <EmptyState
            title="Sin ventas"
            description="No hay ventas registradas que coincidan con los filtros seleccionados."
          />
        ) : filteredOps.length === 0 ? (
          <EmptyState
            title="Sin coincidencias"
            description="Ajusta los filtros o la búsqueda para ver resultados."
          />
        ) : (
          <Table>
            <THead>
              <tr>
                <TH>ID</TH>
                <TH>Fecha registro</TH>
                <TH>Línea</TH>
                <TH>Cliente</TH>
                <TH>Material</TH>
                <TH>Vehículo</TH>
                <TH>Inicio</TH>
                <TH>Fin</TH>
                <TH>Valor</TH>
                <TH>Medio pago</TH>
                <TH>Estado</TH>
                <TH>Pago Siigo</TH>
                <TH>Factura</TH>
                <TH>Acciones</TH>
                <TH>Descripción</TH>
              </tr>
            </THead>
            <TBody>
              {filteredOps.map((o) => (
                <tr key={o.id} className="hover:bg-brand-yellow/[0.06]">
                  <TD>{o.id}</TD>
                  <TD>{fmtDateOnly(o.fechaInsercion)}</TD>
                  <TD>
                    <span className="inline-flex rounded-full bg-brand-yellow/20 px-2 py-1 text-xs font-bold text-brand-dark ring-1 ring-brand-yellow/50">
                      {lineasById.get(o.lineaNegocioId) ?? `#${o.lineaNegocioId}`}
                    </span>
                  </TD>
                  <TD>{proveedoresById.get(o.proveedorId) ?? `#${o.proveedorId}`}</TD>
                  <TD>{materialesById.get(o.materialId) ?? `#${o.materialId}`}</TD>
                  <TD>{vehiculosById.get(o.vehiculoId) ?? `#${o.vehiculoId}`}</TD>
                  <TD>{fmtDateOnly(o.fechaInicio)}</TD>
                  <TD>{fmtDateOnly(o.fechaFin)}</TD>
                  <TD>
                    <span className="font-extrabold text-brand-dark">{o.valor}</span>
                  </TD>
                  <TD>{o.medioPago}</TD>
                  <TD>
                    <StatusBadge>{o.estado ?? 'REGISTRADA'}</StatusBadge>
                  </TD>
                  <TD>
                    {o.estadoPago ? <StatusBadge>{o.estadoPago}</StatusBadge> : <span className="text-zinc-400">—</span>}
                  </TD>
                  <TD>{o.facturaSiigo ?? '—'}</TD>
                  <TD>
                    {o.estado !== 'CONFIRMADA' ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="rounded-xl border-zinc-200"
                        onClick={() => {
                          void confirmar(o.id).then(() => setAsignarId(o.id))
                        }}
                      >
                        Confirmar
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="rounded-xl border-zinc-200"
                        onClick={() => setAsignarId(o.id)}
                      >
                        {o.facturaSiigo ? 'Cambiar factura' : 'Asignar factura'}
                      </Button>
                    )}
                  </TD>
                  <TD className="max-w-[200px] truncate">
                    <span title={o.descripcion ?? undefined}>{o.descripcion ?? '—'}</span>
                  </TD>
                </tr>
              ))}
            </TBody>
          </Table>
        )}
      </div>

      <div className="mt-10">
        <PageListToolbar
          title="Inserciones de costos"
          description="Nómina, gastos administrativos, costos de vehículo y financieros del mismo rango de fechas."
        />
        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Select
              label="Categoría"
              value={categoriaCosto}
              onChange={(e) => {
                setCategoriaCosto(e.target.value)
                setTipoCostoId('')
              }}
            >
              <option value="">Todas</option>
              {CATEGORIAS_COSTO.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="lg:col-span-4">
            <Select
              label="Tipo de costo"
              value={tipoCostoId}
              onChange={(e) => setTipoCostoId(e.target.value)}
            >
              <option value="">Todos</option>
              {tiposFiltrados.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.tipoCosto}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className="mt-6">
          {costosLoading ? (
            <div className="h-40 w-full animate-pulse rounded-2xl bg-zinc-100" />
          ) : costosError ? (
            <EmptyState title="No se pudieron cargar los costos" description={costosError} />
          ) : costosItems.length === 0 ? (
            <EmptyState
              title="Sin costos"
              description="No hay inserciones de costo registradas."
            />
          ) : filteredCostos.length === 0 ? (
            <EmptyState
              title="Sin coincidencias"
              description="Ningún costo coincide con la categoría, el tipo o el rango de fechas."
            />
          ) : (
            <Table>
              <THead>
                <tr>
                  <TH>Fecha</TH>
                  <TH>Categoría</TH>
                  <TH>Tipo de costo</TH>
                  <TH>Valor</TH>
                  <TH>Medio de pago</TH>
                  <TH>Descripción</TH>
                </tr>
              </THead>
              <TBody>
                {filteredCostos.map((row) => (
                  <tr key={`${row.categoria}-${row.id}`} className="hover:bg-brand-yellow/[0.06]">
                    <TD className="tabular-nums text-zinc-600">{fmtDateOnly(row.fechaInsercion)}</TD>
                    <TD>
                      <StatusBadge>{labelCategoria(row.categoria)}</StatusBadge>
                    </TD>
                    <TD className="font-semibold text-brand-dark">
                      {tiposById.get(row.tipoCostoId) ?? row.tipoCostoId}
                    </TD>
                    <TD className="tabular-nums font-semibold">{fmtMoneyCop(row.valor)}</TD>
                    <TD>{row.medioPago}</TD>
                    <TD className="max-w-[220px] truncate text-brand-muted">
                      <span title={row.descripcion ?? row.motivo ?? undefined}>
                        {row.descripcion ?? row.motivo ?? '—'}
                      </span>
                    </TD>
                  </tr>
                ))}
              </TBody>
            </Table>
          )}
        </div>
      </div>

      <AsignarFacturaModal
        operacionId={asignarId}
        onClose={() => setAsignarId(null)}
        onAssign={async (id, facturaId) => {
          await asignarFactura(id, facturaId)
        }}
      />
    </div>
  )
}
