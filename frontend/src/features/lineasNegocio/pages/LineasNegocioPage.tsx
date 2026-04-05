import { useEffect, useMemo, useState } from 'react'
import { Button } from '../../../shared/ui/Button'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { Modal } from '../../../shared/ui/Modal'
import { Table, TBody, TD, TH, THead } from '../../../shared/ui/Table'
import { LineaNegocioForm } from '../components/LineaNegocioForm'
import type { LineaNegocio } from '../types'
import { useLineasNegocioStore } from '../store'

export function LineasNegocioPage() {
  const { items, isLoading, error, fetchAll, create, update, setEstado } =
    useLineasNegocioStore()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<LineaNegocio | null>(null)

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => b.id - a.id)
  }, [items])

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-semibold text-brand-dark">
            Catálogo de líneas de negocio
          </div>
          <div className="text-sm text-brand-muted">
            Crea, edita y cambia el estado (campo Estado del modelo).
          </div>
        </div>
        <Button
          onClick={() => {
            setEditing(null)
            setOpen(true)
          }}
        >
          Nueva línea
        </Button>
      </div>

      <div className="mt-6">
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
                <TH>Acciones</TH>
              </tr>
            </THead>
            <TBody>
              {sorted.map((x) => (
                <tr key={x.id} className="hover:bg-brand-yellow/5">
                  <TD>{x.id}</TD>
                  <TD>
                    <div className="font-medium text-brand-dark">{x.lineaNegocio}</div>
                  </TD>
                  <TD>{x.descripcion ?? '-'}</TD>
                  <TD>
                    <span
                      className={[
                        'inline-flex rounded-full px-2 py-1 text-xs font-medium',
                        String(x.estado).toUpperCase() === 'ACTIVO'
                          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
                          : 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
                      ].join(' ')}
                    >
                      {x.estado}
                    </span>
                  </TD>
                  <TD>
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
