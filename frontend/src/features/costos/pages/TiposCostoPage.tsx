import { useEffect, useMemo, useState } from 'react'
import { useLayoutSearch } from '../../../app/shell/LayoutSearchContext'
import { esActivo } from '../../auth/roles'
import { Button } from '../../../shared/ui/Button'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { Modal } from '../../../shared/ui/Modal'
import { PageListToolbar } from '../../../shared/ui/PageListToolbar'
import { StatMiniCard } from '../../../shared/ui/StatMiniCard'
import { StatusBadge } from '../../../shared/ui/StatusBadge'
import { Table, TBody, TD, TH, THead } from '../../../shared/ui/Table'
import { TipoCostoForm } from '../components/TipoCostoForm'
import { useTiposCostoStore } from '../store'
import { labelCategoria, type TipoCosto, type TipoCostoUpdate } from '../types'

function matchesTipo(x: TipoCosto, q: string) {
  const s = q.trim().toLowerCase()
  if (!s) return true
  return (
    x.id.toLowerCase().includes(s) ||
    x.tipoCosto.toLowerCase().includes(s) ||
    labelCategoria(x.flujo).toLowerCase().includes(s) ||
    x.flujo.toLowerCase().includes(s) ||
    (x.descripcion ?? '').toLowerCase().includes(s) ||
    x.estado.toLowerCase().includes(s)
  )
}

export function TiposCostoPage() {
  const { items, isLoading, error, fetchAll, create, update } = useTiposCostoStore()
  const { query: layoutQuery } = useLayoutSearch()
  const [tableQuery, setTableQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<TipoCosto | null>(null)

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const sorted = useMemo(
    () => [...items].sort((a, b) => a.tipoCosto.localeCompare(b.tipoCosto, 'es')),
    [items],
  )
  const filtered = useMemo(
    () => sorted.filter((x) => matchesTipo(x, layoutQuery) && matchesTipo(x, tableQuery)),
    [sorted, layoutQuery, tableQuery],
  )
  const activos = sorted.filter((x) => esActivo(x.estado)).length

  return (
    <div>
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatMiniCard label="Tipos de costo" value={sorted.length} icon={<span className="text-sm font-extrabold">TC</span>} />
        <StatMiniCard
          label="Activos"
          value={activos}
          icon={<span className="h-2.5 w-2.5 rounded-full bg-brand-success" />}
          iconBgClass="bg-brand-success-soft text-emerald-800"
        />
        <StatMiniCard
          label="Inactivos"
          value={sorted.length - activos}
          icon={<span className="h-2.5 w-2.5 rounded-full bg-zinc-400" />}
          iconBgClass="bg-zinc-100 text-zinc-600"
        />
      </div>

      <PageListToolbar
        title="Catálogo de tipos de costo"
        description="Clasifica cada tipo según el flujo: nómina, administrativo, vehículo o financiero."
        tableSearch={{ value: tableQuery, onChange: setTableQuery, placeholder: 'Buscar en tabla…' }}
        action={
          <Button
            className="rounded-xl px-5"
            onClick={() => {
              setEditing(null)
              setOpen(true)
            }}
          >
            + Nuevo tipo
          </Button>
        }
      />

      <div className="mt-6">
        {isLoading ? (
          <div className="h-40 animate-pulse rounded-2xl bg-zinc-100" />
        ) : error ? (
          <EmptyState title="No se pudo cargar" description={error} />
        ) : sorted.length === 0 ? (
          <EmptyState
            title="Aún no hay tipos de costo"
            description="Crea el primer tipo para poder registrar movimientos."
          />
        ) : (
          <Table>
            <THead>
              <tr>
                <TH>Tipo</TH>
                <TH>Flujo</TH>
                <TH>Descripción</TH>
                <TH>Estado</TH>
                <TH className="text-right">Acciones</TH>
              </tr>
            </THead>
            <TBody>
              {filtered.map((x) => (
                <tr key={x.id} className="hover:bg-brand-yellow/[0.06]">
                  <TD>
                    <div className="font-semibold text-brand-dark">{x.tipoCosto}</div>
                  </TD>
                  <TD>{labelCategoria(x.flujo)}</TD>
                  <TD className="max-w-xs truncate text-brand-muted">{x.descripcion ?? '—'}</TD>
                  <TD>
                    <StatusBadge>{x.estado}</StatusBadge>
                  </TD>
                  <TD className="text-right">
                    <div className="flex flex-wrap justify-end gap-2">
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
                          update(x.id, {
                            tipoCosto: x.tipoCosto,
                            flujo: x.flujo,
                            descripcion: x.descripcion ?? undefined,
                            estado: esActivo(x.estado) ? 'INACTIVO' : 'ACTIVO',
                          })
                        }
                      >
                        {esActivo(x.estado) ? 'Desactivar' : 'Activar'}
                      </Button>
                    </div>
                  </TD>
                </tr>
              ))}
            </TBody>
          </Table>
        )}
      </div>

      <Modal open={open} title={editing ? 'Editar' : 'Nuevo'} onClose={() => setOpen(false)}>
        <TipoCostoForm
          initial={editing}
          onCancel={() => setOpen(false)}
          onSubmit={async (payload) => {
            if (editing) await update(editing.id, payload as TipoCostoUpdate)
            else await create(payload)
            setOpen(false)
          }}
        />
      </Modal>
    </div>
  )
}
