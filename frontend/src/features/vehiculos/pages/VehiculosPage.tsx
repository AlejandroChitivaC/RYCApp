import { useEffect, useMemo, useState } from 'react'
import { useLayoutSearch } from '../../../app/shell/LayoutSearchContext'
import { esActivo, esAdministrador } from '../../auth/roles'
import { useAuthStore } from '../../auth/store'
import { Button } from '../../../shared/ui/Button'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { Modal } from '../../../shared/ui/Modal'
import { PageListToolbar } from '../../../shared/ui/PageListToolbar'
import { StatMiniCard } from '../../../shared/ui/StatMiniCard'
import { StatusBadge } from '../../../shared/ui/StatusBadge'
import { Table, TBody, TD, TH, THead } from '../../../shared/ui/Table'
import { useUsuariosStore } from '../../usuarios/store'
import type { Vehiculo } from '../types'
import { useVehiculosStore } from '../store'
import { VehiculoForm } from '../components/VehiculoForm'

function IconTruck({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M3 7h11v9H3V7Zm11 3h4l3 3v3h-7V10Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="7" cy="18" r="1.6" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17" cy="18" r="1.6" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function matchesVehiculo(x: Vehiculo, q: string) {
  const s = q.trim().toLowerCase()
  if (!s) return true
  const cond = (x.conductorNombre ?? '').toLowerCase()
  return (
    String(x.id).includes(s) ||
    x.placa.toLowerCase().includes(s) ||
    x.clase.toLowerCase().includes(s) ||
    x.marca.toLowerCase().includes(s) ||
    x.modelo.toLowerCase().includes(s) ||
    String(x.estado).toLowerCase().includes(s) ||
    cond.includes(s)
  )
}

export function VehiculosPage() {
  const { items, isLoading, error, fetchAll, create, update, setEstado } = useVehiculosStore()
  const authUser = useAuthStore((s) => s.user)
  const esAdmin = esAdministrador(authUser?.rol)
  const conductores = useUsuariosStore((s) => s.conductores)
  const fetchConductores = useUsuariosStore((s) => s.fetchConductores)
  const { query: layoutQuery } = useLayoutSearch()
  const [tableQuery, setTableQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Vehiculo | null>(null)

  useEffect(() => {
    fetchAll()
    fetchConductores()
  }, [fetchAll, fetchConductores])

  const sorted = useMemo(() => [...items].sort((a, b) => b.id.localeCompare(a.id)), [items])

  const filtered = useMemo(
    () => sorted.filter((x) => matchesVehiculo(x, layoutQuery) && matchesVehiculo(x, tableQuery)),
    [sorted, layoutQuery, tableQuery],
  )

  const total = sorted.length
  const activos = sorted.filter((x) => esActivo(x.estado)).length
  const inactivos = total - activos

  return (
    <div>
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatMiniCard
          icon={<IconTruck className="h-6 w-6" />}
          label="Total vehículos"
          value={total}
        />
        <StatMiniCard
          icon={<span className="h-2.5 w-2.5 rounded-full bg-brand-success" />}
          label="Activos"
          value={activos}
          iconBgClass="bg-brand-success-soft text-emerald-800"
        />
        <StatMiniCard
          icon={<span className="h-2.5 w-2.5 rounded-full bg-zinc-400" />}
          label="Inactivos"
          value={inactivos}
          iconBgClass="bg-zinc-100 text-zinc-600"
        />
      </div>

      <PageListToolbar
        title="Catálogo de vehículos"
        description="Placas, clase, marca y conductor asignado."
        tableSearch={{ value: tableQuery, onChange: setTableQuery }}
        action={
          <Button
            className="rounded-xl px-5"
            onClick={() => {
              setEditing(null)
              setOpen(true)
            }}
          >
            + Nuevo vehículo
          </Button>
        }
      />

      <div className="mt-2">
        {isLoading ? (
          <div className="h-40 w-full animate-pulse rounded-2xl bg-zinc-100" />
        ) : error ? (
          <EmptyState title="No se pudo cargar" description={error} />
        ) : sorted.length === 0 ? (
          <EmptyState title="Sin vehículos" description="Crea el primer vehículo." />
        ) : (
          <Table>
            <THead>
              <tr>
                <TH>ID</TH>
                <TH>Placa</TH>
                <TH>Clase</TH>
                <TH>Marca</TH>
                <TH>Modelo</TH>
                <TH>Estado</TH>
                <TH>Conductor</TH>
                <TH className="text-right">Acciones</TH>
              </tr>
            </THead>
            <TBody>
              {filtered.map((x) => (
                <tr key={x.id} className="hover:bg-brand-yellow/[0.06]">
                  <TD className="tabular-nums text-zinc-600">{x.id}</TD>
                  <TD>
                    <div className="font-semibold text-brand-dark">{x.placa}</div>
                  </TD>
                  <TD>{x.clase}</TD>
                  <TD>{x.marca}</TD>
                  <TD>{x.modelo}</TD>
                  <TD>
                    <StatusBadge>{String(x.estado).replace(/_/g, ' ')}</StatusBadge>
                  </TD>
                  <TD className="text-brand-muted">{x.conductorNombre ?? '—'}</TD>
                  <TD className="text-right">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="rounded-xl border-zinc-200"
                        onClick={() => {
                          setEditing(x)
                          setOpen(true)
                        }}
                      >
                        Editar
                      </Button>
                      {esAdmin ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="rounded-xl border-zinc-200"
                          onClick={() =>
                            setEstado(x.id, esActivo(x.estado) ? 'INACTIVO' : 'ACTIVO')
                          }
                        >
                          {esActivo(x.estado) ? 'Desactivar' : 'Activar'}
                        </Button>
                      ) : null}
                    </div>
                  </TD>
                </tr>
              ))}
            </TBody>
          </Table>
        )}
      </div>

      <Modal open={open} title={editing ? 'Editar' : 'Nuevo'} onClose={() => setOpen(false)}>
        <VehiculoForm
          initial={editing}
          conductores={conductores}
          onCancel={() => setOpen(false)}
          onSubmit={async (payload) => {
            if (editing) await update(editing.id, payload)
            else await create(payload)
            setOpen(false)
          }}
        />
      </Modal>
    </div>
  )
}
