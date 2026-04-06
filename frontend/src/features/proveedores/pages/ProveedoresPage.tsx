import { useEffect, useMemo, useState } from 'react'
import { useLayoutSearch } from '../../../app/shell/LayoutSearchContext'
import { Button } from '../../../shared/ui/Button'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { Modal } from '../../../shared/ui/Modal'
import { PageListToolbar } from '../../../shared/ui/PageListToolbar'
import { Table, TBody, TD, TH, THead } from '../../../shared/ui/Table'
import { ProveedorForm } from '../components/ProveedorForm'
import type { Proveedor } from '../types'
import { useProveedoresStore } from '../store'

function matchesProveedor(x: Proveedor, q: string) {
  const s = q.trim().toLowerCase()
  if (!s) return true
  const ubi = [x.departamento, x.municipio].filter(Boolean).join(' ').toLowerCase()
  return (
    String(x.id).includes(s) ||
    x.nombre.toLowerCase().includes(s) ||
    x.nit.toLowerCase().includes(s) ||
    ubi.includes(s)
  )
}

export function ProveedoresPage() {
  const { items, isLoading, error, fetchAll, create, update } = useProveedoresStore()
  const { query: layoutQuery } = useLayoutSearch()
  const [tableQuery, setTableQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Proveedor | null>(null)

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const sorted = useMemo(() => [...items].sort((a, b) => b.id - a.id), [items])

  const filtered = useMemo(
    () => sorted.filter((x) => matchesProveedor(x, layoutQuery) && matchesProveedor(x, tableQuery)),
    [sorted, layoutQuery, tableQuery],
  )

  return (
    <div>
      <PageListToolbar
        title="Catálogo de proveedores"
        description="Proveedores y ubicación según el modelo de datos."
        tableSearch={{ value: tableQuery, onChange: setTableQuery }}
        action={
          <Button
            className="rounded-xl px-5"
            onClick={() => {
              setEditing(null)
              setOpen(true)
            }}
          >
            + Nuevo proveedor
          </Button>
        }
      />

      <div className="mt-2">
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
                <TH className="text-right">Acciones</TH>
              </tr>
            </THead>
            <TBody>
              {filtered.map((x) => (
                <tr key={x.id} className="hover:bg-brand-yellow/[0.06]">
                  <TD className="tabular-nums text-zinc-600">{x.id}</TD>
                  <TD>
                    <span className="font-semibold text-brand-dark">{x.nombre}</span>
                  </TD>
                  <TD>{x.nit}</TD>
                  <TD className="text-brand-muted">
                    {[x.departamento, x.municipio].filter(Boolean).join(' · ') || '—'}
                  </TD>
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
