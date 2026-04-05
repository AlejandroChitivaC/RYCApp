import { useEffect, useMemo, useState } from 'react'
import { Button } from '../../../shared/ui/Button'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { Modal } from '../../../shared/ui/Modal'
import { Table, TBody, TD, TH, THead } from '../../../shared/ui/Table'
import { UsuarioForm } from '../components/UsuarioForm'
import type { Usuario } from '../types'
import { useUsuariosStore } from '../store'

export function UsuariosPage() {
  const { items, roles, isLoading, error, fetchAll, create, update } = useUsuariosStore()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Usuario | null>(null)

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const sorted = useMemo(() => [...items].sort((a, b) => b.id - a.id), [items])

  const rolNombre = useMemo(() => {
    const m = new Map<number, string>()
    for (const r of roles) m.set(r.id, r.descripcion)
    return m
  }, [roles])

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-semibold text-brand-dark">Usuarios</div>
          <div className="text-sm text-brand-muted">
            Entidad Usuario (FK a Rol). El usuario sistema inicial viene del seed SQL.
          </div>
        </div>
        <Button
          onClick={() => {
            setEditing(null)
            setOpen(true)
          }}
        >
          Nuevo usuario
        </Button>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="h-40 w-full animate-pulse rounded-2xl bg-zinc-200" />
        ) : error ? (
          <EmptyState title="No se pudo cargar" description={error} />
        ) : sorted.length === 0 ? (
          <EmptyState title="Sin usuarios" description="Crea un usuario." />
        ) : (
          <Table>
            <THead>
              <tr>
                <TH>ID</TH>
                <TH>Cédula</TH>
                <TH>Nombre</TH>
                <TH>Rol</TH>
                <TH>Estado</TH>
                <TH>Acciones</TH>
              </tr>
            </THead>
            <TBody>
              {sorted.map((x) => (
                <tr key={x.id} className="hover:bg-brand-yellow/5">
                  <TD>{x.id}</TD>
                  <TD>{x.cedula}</TD>
                  <TD>
                    {x.nombre} {x.apellido}
                  </TD>
                  <TD>{rolNombre.get(x.rolId) ?? `#${x.rolId}`}</TD>
                  <TD>{x.estado}</TD>
                  <TD>
                    <Button
                      variant="secondary"
                      size="sm"
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

      <Modal open={open} title={editing ? 'Editar usuario' : 'Nuevo usuario'} onClose={() => setOpen(false)}>
        <UsuarioForm
          initial={editing}
          roles={roles}
          onCancel={() => setOpen(false)}
          onSubmit={async (payload) => {
            if (editing) {
              await update(editing.id, {
                rolId: payload.rolId,
                cedula: payload.cedula,
                nombre: payload.nombre,
                apellido: payload.apellido,
                estado: payload.estado ?? editing.estado,
              })
            } else {
              await create({
                rolId: payload.rolId,
                cedula: payload.cedula,
                nombre: payload.nombre,
                apellido: payload.apellido,
              })
            }
            setOpen(false)
          }}
        />
      </Modal>
    </div>
  )
}
