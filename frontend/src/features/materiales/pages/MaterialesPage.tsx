import { useEffect, useMemo, useState } from 'react'
import { Button } from '../../../shared/ui/Button'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { Modal } from '../../../shared/ui/Modal'
import { Table, TBody, TD, TH, THead } from '../../../shared/ui/Table'
import { MaterialForm } from '../components/MaterialForm'
import type { Material } from '../types'
import { useMaterialesStore } from '../store'

export function MaterialesPage() {
  const { items, isLoading, error, fetchAll, create, update } = useMaterialesStore()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Material | null>(null)

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const sorted = useMemo(() => [...items].sort((a, b) => b.id - a.id), [items])

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-semibold text-brand-dark">Materiales</div>
          <div className="text-sm text-brand-muted">Catálogo Material del ER.</div>
        </div>
        <Button
          onClick={() => {
            setEditing(null)
            setOpen(true)
          }}
        >
          Nuevo material
        </Button>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="h-40 animate-pulse rounded-2xl bg-zinc-200" />
        ) : error ? (
          <EmptyState title="No se pudo cargar" description={error} />
        ) : sorted.length === 0 ? (
          <EmptyState title="Sin materiales" description="Crea el primer registro." />
        ) : (
          <Table>
            <THead>
              <tr>
                <TH>ID</TH>
                <TH>Material</TH>
                <TH>Descripción</TH>
                <TH>Acciones</TH>
              </tr>
            </THead>
            <TBody>
              {sorted.map((x) => (
                <tr key={x.id}>
                  <TD>{x.id}</TD>
                  <TD>
                    <span className="font-medium">{x.material}</span>
                  </TD>
                  <TD>{x.descripcion ?? '—'}</TD>
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
        <MaterialForm
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
