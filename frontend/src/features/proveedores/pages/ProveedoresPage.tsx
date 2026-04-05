import { useEffect, useMemo, useState } from 'react'
import { Button } from '../../../shared/ui/Button'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { Modal } from '../../../shared/ui/Modal'
import { Table, TBody, TD, TH, THead } from '../../../shared/ui/Table'
import { ProveedorForm } from '../components/ProveedorForm'
import type { Proveedor } from '../types'
import { useProveedoresStore } from '../store'

export function ProveedoresPage() {
  const { items, isLoading, error, fetchAll, create, update } = useProveedoresStore()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Proveedor | null>(null)

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const sorted = useMemo(() => [...items].sort((a, b) => b.id - a.id), [items])

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-semibold text-brand-dark">Proveedores</div>
          <div className="text-sm text-brand-muted">Catálogo Proveedor del ER.</div>
        </div>
        <Button
          onClick={() => {
            setEditing(null)
            setOpen(true)
          }}
        >
          Nuevo proveedor
        </Button>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="h-40 animate-pulse rounded-2xl bg-zinc-200" />
        ) : error ? (
          <EmptyState title="No se pudo cargar" description={error} />
        ) : sorted.length === 0 ? (
          <EmptyState title="Sin proveedores" description="Crea el primer proveedor." />
        ) : (
          <Table>
            <THead>
              <tr>
                <TH>ID</TH>
                <TH>Nombre</TH>
                <TH>NIT</TH>
                <TH>Ubicación</TH>
                <TH>Acciones</TH>
              </tr>
            </THead>
            <TBody>
              {sorted.map((x) => (
                <tr key={x.id}>
                  <TD>{x.id}</TD>
                  <TD>
                    <span className="font-medium">{x.nombre}</span>
                  </TD>
                  <TD>{x.nit}</TD>
                  <TD>
                    {[x.departamento, x.municipio].filter(Boolean).join(' · ') || '—'}
                  </TD>
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

      <Modal open={open} title={editing ? 'Editar' : 'Nuevo'} onClose={() => setOpen(false)}>
        <ProveedorForm
          initial={editing}
          onCancel={() => setOpen(false)}
          onSubmit={async (p) => {
            if (editing) await update(editing.id, p)
            else await create(p)
            setOpen(false)
          }}
        />
      </Modal>
    </div>
  )
}
