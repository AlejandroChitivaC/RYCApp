import { useEffect, useMemo, useState } from 'react'
import { useLayoutSearch } from '../../../app/shell/LayoutSearchContext'
import { Button } from '../../../shared/ui/Button'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { Modal } from '../../../shared/ui/Modal'
import { PageListToolbar } from '../../../shared/ui/PageListToolbar'
import { StatusBadge } from '../../../shared/ui/StatusBadge'
import { Table, TBody, TD, TH, THead } from '../../../shared/ui/Table'
import { useUsuariosStore } from '../../usuarios/store'
import type { Vehiculo } from '../types'
import { useVehiculosStore } from '../store'
import { VehiculoForm } from '../components/VehiculoForm'

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
  const { items, isLoading, error, fetchAll, create, update } = useVehiculosStore()
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

  const sorted = useMemo(() => [...items].sort((a, b) => b.id - a.id), [items])

  const filtered = useMemo(
    () => sorted.filter((x) => matchesVehiculo(x, layoutQuery) && matchesVehiculo(x, tableQuery)),
    [sorted, layoutQuery, tableQuery],
  )

  return (
    <div>
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
