import { useEffect, useMemo, useState } from 'react'
import { useLayoutSearch } from '../../../app/shell/LayoutSearchContext'
import { Button } from '../../../shared/ui/Button'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { Modal } from '../../../shared/ui/Modal'
import { PageListToolbar } from '../../../shared/ui/PageListToolbar'
import { StatMiniCard } from '../../../shared/ui/StatMiniCard'
import { StatusBadge } from '../../../shared/ui/StatusBadge'
import { Table, TBody, TD, TH, THead } from '../../../shared/ui/Table'
import { MaterialForm } from '../components/MaterialForm'
import type { Material } from '../types'
import { useMaterialesStore } from '../store'

function IconCubeSm({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M12 3 4 7v10l8 4 8-4V7l-8-4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="m4 7 8 4 8-4M12 11v10" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function matchesMaterial(m: Material, q: string) {
  const s = q.trim().toLowerCase()
  if (!s) return true
  return (
    String(m.id).includes(s) ||
    m.material.toLowerCase().includes(s) ||
    (m.descripcion ?? '').toLowerCase().includes(s)
  )
}

function exportMaterialesCsv(rows: Material[]) {
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`
  const header = ['ID', 'Material', 'Descripción', 'Categoría', 'Estado']
  const lines = [
    header.join(','),
    ...rows.map((r) =>
      [r.id, r.material, r.descripcion ?? '', '—', 'Activo'].map((c) => esc(String(c))).join(','),
    ),
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'materiales.csv'
  a.click()
  URL.revokeObjectURL(url)
}

const toolbarBtn =
  'inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-bold text-brand-dark shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50'

export function MaterialesPage() {
  const { items, isLoading, error, fetchAll, create, update } = useMaterialesStore()
  const { query: layoutQuery } = useLayoutSearch()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Material | null>(null)
  const [tableQuery, setTableQuery] = useState('')

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const sorted = useMemo(() => [...items].sort((a, b) => b.id - a.id), [items])

  const filtered = useMemo(
    () => sorted.filter((m) => matchesMaterial(m, layoutQuery) && matchesMaterial(m, tableQuery)),
    [sorted, layoutQuery, tableQuery],
  )

  const total = sorted.length
  const activos = sorted.length
  const inactivos = 0

  return (
    <div>
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatMiniCard
          icon={<IconCubeSm className="h-6 w-6" />}
          label="Total materiales"
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
        title="Catálogo de materiales"
        description="Listado del catálogo de materiales del sistema."
        tableSearch={{ value: tableQuery, onChange: setTableQuery, placeholder: 'Buscar en tabla…' }}
        action={
          <Button
            onClick={() => {
              setEditing(null)
              setOpen(true)
            }}
            className="rounded-xl px-5"
          >
            + Nuevo material
          </Button>
        }
        extra={
          <div className="flex flex-wrap gap-2">
            <button type="button" className={toolbarBtn} disabled title="Próximamente">
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-zinc-500" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
              </svg>
              Filtros
            </button>
            <button
              type="button"
              className={toolbarBtn}
              disabled={filtered.length === 0}
              onClick={() => exportMaterialesCsv(filtered)}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-zinc-500" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3v12m0 0 4-4m-4 4-4-4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5 19h14" strokeLinecap="round" />
              </svg>
              Exportar
            </button>
          </div>
        }
      />

      <div className="mt-6">
        {isLoading ? (
          <div className="h-40 animate-pulse rounded-2xl bg-zinc-100" />
        ) : error ? (
          <EmptyState title="No se pudo cargar" description={error} />
        ) : sorted.length === 0 ? (
          <EmptyState title="Sin materiales" description="Crea el primer registro." />
        ) : (
          <>
            <Table>
              <THead>
                <tr>
                  <TH>
                    <span className="inline-flex items-center gap-1.5">
                      ID <span className="font-normal normal-case text-zinc-300">↕</span>
                    </span>
                  </TH>
                  <TH>
                    <span className="inline-flex items-center gap-1.5">
                      Material <span className="font-normal normal-case text-zinc-300">↕</span>
                    </span>
                  </TH>
                  <TH>Descripción</TH>
                  <TH>Categoría</TH>
                  <TH>Estado</TH>
                  <TH className="text-right">Acciones</TH>
                </tr>
              </THead>
              <TBody>
                {filtered.map((x) => (
                  <tr key={x.id} className="transition hover:bg-brand-yellow/[0.06]">
                    <TD className="tabular-nums text-zinc-600">{x.id}</TD>
                    <TD>
                      <span className="inline-flex items-center gap-2">
                        <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-yellow/15 text-brand-dark ring-1 ring-brand-yellow/25">
                          <IconCubeSm className="h-4 w-4" />
                        </span>
                        <span className="font-semibold text-brand-dark">{x.material}</span>
                      </span>
                    </TD>
                    <TD className="max-w-xs truncate text-brand-muted">{x.descripcion ?? '—'}</TD>
                    <TD className="text-brand-muted">—</TD>
                    <TD>
                      <StatusBadge>Activo</StatusBadge>
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
            <div className="mt-4 flex flex-col gap-3 border-t border-zinc-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-brand-muted">
                Mostrando <span className="font-bold text-brand-dark">{filtered.length}</span> de{' '}
                <span className="font-bold text-brand-dark">{sorted.length}</span> materiales
              </p>
              <div className="flex gap-2">
                <button type="button" className={toolbarBtn} disabled>
                  Anterior
                </button>
                <button type="button" className={toolbarBtn} disabled>
                  Siguiente
                </button>
              </div>
            </div>
          </>
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
