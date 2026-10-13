import { useEffect, useMemo, useState } from 'react'
import { useLayoutSearch } from '../../../app/shell/LayoutSearchContext'
import { Button } from '../../../shared/ui/Button'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { Input } from '../../../shared/ui/Input'
import { Modal } from '../../../shared/ui/Modal'
import { PageListToolbar } from '../../../shared/ui/PageListToolbar'
import { Select } from '../../../shared/ui/Select'
import { StatusBadge } from '../../../shared/ui/StatusBadge'
import { Table, TBody, TD, TH, THead } from '../../../shared/ui/Table'
import { useLineasNegocioStore } from '../../lineasNegocio/store'
import { useMaterialesStore } from '../../materiales/store'
import { useProveedoresStore } from '../../proveedores/store'
import { useAuthStore } from '../../auth/store'
import { esActivo, hasRole, ROLES_CONSULTA_HISTORIAL } from '../../auth/roles'
import { useVehiculosStore } from '../../vehiculos/store'
import { AsignarFacturaModal } from '../components/AsignarFacturaModal'
import { OperacionForm } from '../components/OperacionForm'
import type { Operacion } from '../types'
import { useOperacionesStore } from '../store'
import { fmtDateOnly } from '../../../shared/utils/format'

function matchesOperacion(
  o: Operacion,
  q: string,
  lineasById: Map<string, string>,
  materialesById: Map<string, string>,
) {
  const s = q.trim().toLowerCase()
  if (!s) return true
  const linea = (lineasById.get(o.lineaNegocioId) ?? '').toLowerCase()
  const mat = (materialesById.get(o.materialId) ?? '').toLowerCase()
  return (
    String(o.id).includes(s) ||
    fmtDateOnly(o.fechaInsercion).toLowerCase().includes(s) ||
    linea.includes(s) ||
    mat.includes(s) ||
    String(o.valor).toLowerCase().includes(s) ||
    String(o.medioPago).toLowerCase().includes(s)
  )
}

export function OperacionesPage() {
  const items = useOperacionesStore((s) => s.items)
  const isLoading = useOperacionesStore((s) => s.isLoading)
  const error = useOperacionesStore((s) => s.error)
  const filters = useOperacionesStore((s) => s.filters)
  const setFilters = useOperacionesStore((s) => s.setFilters)
  const fetchAll = useOperacionesStore((s) => s.fetchAll)
  const create = useOperacionesStore((s) => s.create)
  const confirmar = useOperacionesStore((s) => s.confirmar)
  const asignarFactura = useOperacionesStore((s) => s.asignarFactura)

  const lineasItems = useLineasNegocioStore((s) => s.items)
  const fetchLineas = useLineasNegocioStore((s) => s.fetchAll)

  const authUser = useAuthStore((s) => s.user)
  const puedeConfirmar = hasRole(authUser?.rol, ROLES_CONSULTA_HISTORIAL)

  const vehiculosItems = useVehiculosStore((s) => s.items)
  const fetchVehiculos = useVehiculosStore((s) => s.fetchAll)

  const materialesItems = useMaterialesStore((s) => s.items)
  const fetchMateriales = useMaterialesStore((s) => s.fetchAll)

  const proveedoresItems = useProveedoresStore((s) => s.items)
  const fetchProveedores = useProveedoresStore((s) => s.fetchAll)

  const [open, setOpen] = useState(false)
  const [asignarId, setAsignarId] = useState<string | null>(null)
  const { query: layoutQuery } = useLayoutSearch()
  const [tableQuery, setTableQuery] = useState('')

  useEffect(() => {
    fetchLineas()
    fetchVehiculos()
    fetchMateriales()
    fetchProveedores()
    fetchAll()
  }, [
    fetchLineas,
    fetchVehiculos,
    fetchMateriales,
    fetchProveedores,
    fetchAll,
  ])

  const catalogos = useMemo(
    () => ({
      lineas: lineasItems.filter((x) => esActivo(x.estado)),
      vehiculos: vehiculosItems.filter((x) => esActivo(x.estado) && x.conductorId != null),
      materiales: materialesItems,
      proveedores: proveedoresItems.filter((x) => esActivo(x.estado)),
    }),
    [lineasItems, vehiculosItems, materialesItems, proveedoresItems],
  )

  const usuarioRegistroLabel = authUser
    ? `${authUser.nombre} ${authUser.apellido} · ${authUser.correo}`
    : '—'

  const sorted = useMemo(() => [...items].sort((a, b) => b.id.localeCompare(a.id)), [items])

  const lineasById = useMemo(() => {
    const map = new Map<string, string>()
    for (const l of lineasItems) map.set(l.id, l.lineaNegocio)
    return map
  }, [lineasItems])

  const materialesById = useMemo(() => {
    const map = new Map<string, string>()
    for (const m of materialesItems) map.set(m.id, m.material)
    return map
  }, [materialesItems])

  const filteredOps = useMemo(
    () =>
      sorted.filter(
        (o) =>
          matchesOperacion(o, layoutQuery, lineasById, materialesById) &&
          matchesOperacion(o, tableQuery, lineasById, materialesById),
      ),
    [sorted, layoutQuery, tableQuery, lineasById, materialesById],
  )

  return (
    <div>
      <PageListToolbar
        title="Ventas registradas"
        description="Confirma una venta y asígnale la factura de Siigo que ya esté sincronizada."
        tableSearch={{ value: tableQuery, onChange: setTableQuery }}
        action={
          <Button className="rounded-xl px-5" onClick={() => setOpen(true)}>
            + Nueva venta
          </Button>
        }
      />

      <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <Input
            label="Desde (Fecha_Inserción)"
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
            label="Vehículo"
            value={filters.vehiculoId}
            onChange={(e) => setFilters({ vehiculoId: e.target.value })}
          >
            <option value="">Todos</option>
            {vehiculosItems.map((v) => (
              <option key={v.id} value={v.id}>
                {v.placa}
              </option>
            ))}
          </Select>
        </div>

        <div className="lg:col-span-12 flex flex-wrap items-end gap-2">
          <Button
            variant="secondary"
            className="rounded-xl border-zinc-200"
            onClick={() => fetchAll()}
            loading={isLoading}
            size="sm"
          >
            Aplicar filtros
          </Button>
          <Button
            variant="secondary"
            className="rounded-xl border-zinc-200"
            onClick={() => {
              setFilters({ from: '', to: '', lineaNegocioId: '', vehiculoId: '' })
              setTimeout(() => fetchAll(), 0)
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
        ) : sorted.length === 0 ? (
          <EmptyState
            title="Sin ventas"
            description="Registra una venta para comenzar."
          />
        ) : (
          <Table>
            <THead>
              <tr>
                <TH>ID</TH>
                <TH>Fecha inserción</TH>
                <TH>Línea</TH>
                <TH>Material</TH>
                <TH>Valor</TH>
                <TH>Medio pago</TH>
                <TH>Estado</TH>
                <TH>Factura Siigo</TH>
                {puedeConfirmar ? <TH>Acciones</TH> : null}
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
                  <TD>{materialesById.get(o.materialId) ?? `#${o.materialId}`}</TD>
                  <TD>
                    <span className="font-extrabold text-brand-dark">{o.valor}</span>
                  </TD>
                  <TD>{o.medioPago}</TD>
                  <TD>
                    <StatusBadge>{o.estado ?? 'REGISTRADA'}</StatusBadge>
                  </TD>
                  <TD>{o.facturaSiigo ?? '—'}</TD>
                  {puedeConfirmar ? (
                    <TD>
                      <div className="flex flex-wrap gap-2">
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
                      </div>
                    </TD>
                  ) : null}
                </tr>
              ))}
            </TBody>
          </Table>
        )}
      </div>

      <AsignarFacturaModal
        operacionId={asignarId}
        onClose={() => setAsignarId(null)}
        onAssign={async (id, facturaId) => {
          await asignarFactura(id, facturaId)
        }}
      />

      <Modal open={open} title="Nueva venta" onClose={() => setOpen(false)}>
        <OperacionForm
          catalogos={catalogos}
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
