import { useEffect, useMemo, useState } from 'react'
import { useLayoutSearch } from '../../../app/shell/LayoutSearchContext'
import { Button } from '../../../shared/ui/Button'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { Modal } from '../../../shared/ui/Modal'
import { PageListToolbar } from '../../../shared/ui/PageListToolbar'
import { StatusBadge } from '../../../shared/ui/StatusBadge'
import { Table, TBody, TD, TH, THead } from '../../../shared/ui/Table'
import { LineaNegocioForm } from '../components/LineaNegocioForm'
import type { LineaNegocio } from '../types'
import { useLineasNegocioStore } from '../store'

function matchesLinea(x: LineaNegocio, q: string) {
  const s = q.trim().toLowerCase()
  if (!s) return true
  return (
    String(x.id).includes(s) ||
    x.lineaNegocio.toLowerCase().includes(s) ||
    String(x.estado).toLowerCase().includes(s) ||
    (x.descripcion ?? '').toLowerCase().includes(s)
  )
}

export function LineasNegocioPage() {
  const { items, isLoading, error, fetchAll, create, update, setEstado } =
    useLineasNegocioStore()
  const { query: layoutQuery } = useLayoutSearch()
  const [tableQuery, setTableQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<LineaNegocio | null>(null)

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => b.id - a.id)
  }, [items])

  const filtered = useMemo(
    () => sorted.filter((x) => matchesLinea(x, layoutQuery) && matchesLinea(x, tableQuery)),
    [sorted, layoutQuery, tableQuery],
  )

  return (
    <div>
      <PageListToolbar
        title="Líneas de negocio"
        description="Crea, edita y cambia el estado según el modelo."
        tableSearch={{ value: tableQuery, onChange: setTableQuery }}
        action={
          <Button
            className="rounded-xl px-5"
            onClick={() => {
              setEditing(null)
              setOpen(true)
            }}
          >
            + Nueva línea
          </Button>
        }
      />

      <div className="mt-2">
        {isLoading ? (
          <div className="rounded-3xl border border-2 border-zinc-200 bg-white p-6 shadow-soft">
            <div className="h-4 w-40 animate-pulse rounded bg-zinc-200" />
            <div className="mt-3 h-4 w-64 animate-pulse rounded bg-zinc-200" />
            <div className="mt-6 h-40 w-full animate-pulse rounded-2xl bg-zinc-200" />
          </div>
        ) : error ? (
          <EmptyState title="No se pudo cargar" description={error} />
        ) : sorted.length === 0 ? (
          <EmptyState
            title="Aún no hay líneas registradas"
            description="Crea la primera línea de negocio para iniciar."
          />
        ) : (
          <Table>
            <THead>
              <tr>
                <TH>ID</TH>
                <TH>Línea_Negocio</TH>
                <TH>Descripción</TH>
                <TH>Estado</TH>
                <TH className="text-right">Acciones</TH>
              </tr>
            </THead>
            <TBody>
              {filtered.map((x) => (
                <tr key={x.id} className="hover:bg-brand-yellow/[0.06]">
                  <TD className="tabular-nums text-zinc-600">{x.id}</TD>
                  <TD>
                    <div className="font-semibold text-brand-dark">{x.lineaNegocio}</div>
                  </TD>
                  <TD className="text-brand-muted">{x.descripcion ?? '—'}</TD>
                  <TD>
                    <StatusBadge>{String(x.estado)}</StatusBadge>
                  </TD>
                  <TD className="text-right">
                    <div className="flex flex-wrap items-center gap-2">
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
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          setEstado(
                            x.id,
                            String(x.estado).toUpperCase() === 'ACTIVO'
                              ? 'INACTIVO'
                              : 'ACTIVO',
                          )
                        }
                      >
                        {String(x.estado).toUpperCase() === 'ACTIVO'
                          ? 'Desactivar'
                          : 'Activar'}
                      </Button>
                    </div>
                  </TD>
                </tr>
              ))}
            </TBody>
          </Table>
        )}
      </div>

      <Modal
        open={open}
        title={editing ? 'Editar' : 'Nueva'}
        onClose={() => setOpen(false)}
      >
        <LineaNegocioForm
          initial={editing}
          onCancel={() => setOpen(false)}
          onSubmit={async (payload) => {
            if (editing) {
              await update(editing.id, payload)
            } else {
              await create(payload)
            }
            setOpen(false)
          }}
        />
      </Modal>
    </div>
  )
}
