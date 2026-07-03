import { useEffect, useMemo, useState } from 'react'
import { useLayoutSearch } from '../../../app/shell/LayoutSearchContext'
import { Button } from '../../../shared/ui/Button'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { Input } from '../../../shared/ui/Input'
import { PageListToolbar } from '../../../shared/ui/PageListToolbar'
import { Select } from '../../../shared/ui/Select'
import { Table, TBody, TD, TH, THead } from '../../../shared/ui/Table'
import { useLineasNegocioStore } from '../../lineasNegocio/store'
import { useMaterialesStore } from '../../materiales/store'
import { useProveedoresStore } from '../../proveedores/store'
import { useVehiculosStore } from '../../vehiculos/store'
import { useHistorialOperacionesStore } from '../historialStore'
import type { Operacion } from '../types'
import { fmtDate } from '../../../shared/utils/format'

function matchesHistorial(
  o: Operacion,
  q: string,
  lineasById: Map<number, string>,
  proveedoresById: Map<number, string>,
  materialesById: Map<number, string>,
  vehiculosById: Map<number, string>,
) {
  const s = q.trim().toLowerCase()
  if (!s) return true
  const linea = (lineasById.get(o.lineaNegocioId) ?? '').toLowerCase()
  const proveedor = (proveedoresById.get(o.proveedorId) ?? '').toLowerCase()
  const material = (materialesById.get(o.materialId) ?? '').toLowerCase()
  const vehiculo = (vehiculosById.get(o.vehiculoId) ?? '').toLowerCase()
  return (
    String(o.id).includes(s) ||
    fmtDate(o.fechaInsercion).toLowerCase().includes(s) ||
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

  const lineasItems = useLineasNegocioStore((s) => s.items)
  const fetchLineas = useLineasNegocioStore((s) => s.fetchAll)

  const proveedoresItems = useProveedoresStore((s) => s.items)
  const fetchProveedores = useProveedoresStore((s) => s.fetchAll)

  const materialesItems = useMaterialesStore((s) => s.items)
  const fetchMateriales = useMaterialesStore((s) => s.fetchAll)

  const vehiculosItems = useVehiculosStore((s) => s.items)
  const fetchVehiculos = useVehiculosStore((s) => s.fetchAll)

  const { query: layoutQuery } = useLayoutSearch()
  const [tableQuery, setTableQuery] = useState('')

  useEffect(() => {
    fetchLineas()
    fetchProveedores()
    fetchMateriales()
    fetchVehiculos()
    fetchHistorial()
  }, [fetchLineas, fetchProveedores, fetchMateriales, fetchVehiculos, fetchHistorial])

  const lineasById = useMemo(() => {
    const map = new Map<number, string>()
    for (const l of lineasItems) map.set(l.id, l.lineaNegocio)
    return map
  }, [lineasItems])

  const proveedoresById = useMemo(() => {
    const map = new Map<number, string>()
    for (const p of proveedoresItems) map.set(p.id, p.nombre)
    return map
  }, [proveedoresItems])

  const materialesById = useMemo(() => {
    const map = new Map<number, string>()
    for (const m of materialesItems) map.set(m.id, m.material)
    return map
  }, [materialesItems])

  const vehiculosById = useMemo(() => {
    const map = new Map<number, string>()
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

  return (
    <div>
      <PageListToolbar
        title="Historial de operaciones"
        description="Consulta de servicios registrados. Filtra por fecha, cliente o línea de negocio. Los registros históricos no pueden eliminarse."
        tableSearch={{ value: tableQuery, onChange: setTableQuery }}
      />

      <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <Input
            label="Desde"
            type="datetime-local"
            value={filters.from}
            onChange={(e) => setFilters({ from: e.target.value })}
          />
        </div>
        <div className="lg:col-span-3">
          <Input
            label="Hasta"
            type="datetime-local"
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
            title="Sin operaciones"
            description="No hay operaciones registradas que coincidan con los filtros seleccionados."
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
                <TH>Descripción</TH>
              </tr>
            </THead>
            <TBody>
              {filteredOps.map((o) => (
                <tr key={o.id} className="hover:bg-brand-yellow/[0.06]">
                  <TD>{o.id}</TD>
                  <TD>{fmtDate(o.fechaInsercion)}</TD>
                  <TD>
                    <span className="inline-flex rounded-full bg-brand-yellow/20 px-2 py-1 text-xs font-bold text-brand-dark ring-1 ring-brand-yellow/50">
                      {lineasById.get(o.lineaNegocioId) ?? `#${o.lineaNegocioId}`}
                    </span>
                  </TD>
                  <TD>{proveedoresById.get(o.proveedorId) ?? `#${o.proveedorId}`}</TD>
                  <TD>{materialesById.get(o.materialId) ?? `#${o.materialId}`}</TD>
                  <TD>{vehiculosById.get(o.vehiculoId) ?? `#${o.vehiculoId}`}</TD>
                  <TD>{fmtDate(o.fechaInicio)}</TD>
                  <TD>{fmtDate(o.fechaFin)}</TD>
                  <TD>
                    <span className="font-extrabold text-brand-dark">{o.valor}</span>
                  </TD>
                  <TD>{o.medioPago}</TD>
                  <TD className="max-w-[200px] truncate">
                    <span title={o.descripcion ?? undefined}>{o.descripcion ?? '—'}</span>
                  </TD>
                </tr>
              ))}
            </TBody>
          </Table>
        )}
      </div>
    </div>
  )
}
