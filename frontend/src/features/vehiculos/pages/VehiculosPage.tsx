import { useEffect, useMemo, useState } from 'react'
import { Button } from '../../../shared/ui/Button'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { Modal } from '../../../shared/ui/Modal'
import { Table, TBody, TD, TH, THead } from '../../../shared/ui/Table'
import { useUsuariosStore } from '../../usuarios/store'
import type { Vehiculo } from '../types'
import { useVehiculosStore } from '../store'
import { VehiculoForm } from '../components/VehiculoForm'

export function VehiculosPage() {
  const { items, isLoading, error, fetchAll, create, update } = useVehiculosStore()
  const conductores = useUsuariosStore((s) => s.conductores)
  const fetchConductores = useUsuariosStore((s) => s.fetchConductores)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Vehiculo | null>(null)

  useEffect(() => {
    fetchAll()
    fetchConductores()
  }, [fetchAll, fetchConductores])

  const sorted = useMemo(() => [...items].sort((a, b) => b.id - a.id), [items])

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-900">Vehículos</div>
          <div className="text-sm text-slate-600">Catálogo según entidad Vehiculo del ER.</div>
        </div>
        <Button
          onClick={() => {
            setEditing(null)
            setOpen(true)
          }}
        >
          Nuevo vehículo
        </Button>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="h-40 w-full animate-pulse rounded-2xl bg-slate-100" />
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
                <TH>Acciones</TH>
              </tr>
            </THead>
            <TBody>
              {sorted.map((x) => (
                <tr key={x.id} className="hover:bg-brand-yellow/5">
                  <TD>{x.id}</TD>
                  <TD>
                    <div className="font-medium text-slate-900">{x.placa}</div>
                  </TD>
                  <TD>{x.clase}</TD>
                  <TD>{x.marca}</TD>
                  <TD>{x.modelo}</TD>
                  <TD>{x.estado}</TD>
                  <TD>{x.conductorNombre ?? '—'}</TD>
                  <TD>
                    <Button
                      variant="secondary"
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
