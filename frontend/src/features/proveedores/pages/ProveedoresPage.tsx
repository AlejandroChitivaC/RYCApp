import { useEffect, useMemo, useState } from 'react'
import { useLayoutSearch } from '../../../app/shell/LayoutSearchContext'
import { esActivo, esAdministrador } from '../../auth/roles'
import { useAuthStore } from '../../auth/store'
import { Button } from '../../../shared/ui/Button'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { Modal } from '../../../shared/ui/Modal'
import { PageListToolbar } from '../../../shared/ui/PageListToolbar'
import { StatMiniCard } from '../../../shared/ui/StatMiniCard'
import { StatusBadge } from '../../../shared/ui/StatusBadge'
import { Table, TBody, TD, TH, THead } from '../../../shared/ui/Table'
import { ProveedorForm } from '../components/ProveedorForm'
import type { Proveedor } from '../types'
import { useProveedoresStore } from '../store'

function IconProvider({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M4 20V8l8-4 8 4v12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M9 20v-6h6v6" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  )
}

function matchesProveedor(x: Proveedor, q: string) {
  const s = q.trim().toLowerCase()
  if (!s) return true
  const ubi = [x.departamento, x.municipio].filter(Boolean).join(' ').toLowerCase()
  return (
    String(x.id).includes(s) ||
    x.nombre.toLowerCase().includes(s) ||
    x.nit.toLowerCase().includes(s) ||
    ubi.includes(s) ||
    String(x.estado ?? '').toLowerCase().includes(s)
  )
}

export function ProveedoresPage() {
  const { items, isLoading, error, fetchAll, create, update, setEstado } = useProveedoresStore()
  const authUser = useAuthStore((s) => s.user)
  const esAdmin = esAdministrador(authUser?.rol)
  const { query: layoutQuery } = useLayoutSearch()
  const [tableQuery, setTableQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Proveedor | null>(null)

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const sorted = useMemo(() => [...items].sort((a, b) => b.id.localeCompare(a.id)), [items])

  const filtered = useMemo(
    () => sorted.filter((x) => matchesProveedor(x, layoutQuery) && matchesProveedor(x, tableQuery)),
    [sorted, layoutQuery, tableQuery],
  )

  const total = sorted.length
  const activos = sorted.filter((x) => esActivo(x.estado)).length
  const inactivos = total - activos

  return (
    <div>
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatMiniCard
          icon={<IconProvider className="h-6 w-6" />}
          label="Total clientes"
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
        title="Catálogo de clientes"
        description="Clientes y ubicación según el modelo de datos."
        tableSearch={{ value: tableQuery, onChange: setTableQuery }}
        action={
          <Button
            className="rounded-xl px-5"
            onClick={() => {
              setEditing(null)
              setOpen(true)
            }}
          >
            + Nuevo cliente
          </Button>
        }
      />

      <div className="mt-2">
        {isLoading ? (
          <div className="h-40 animate-pulse rounded-2xl bg-zinc-200" />
        ) : error ? (
          <EmptyState title="No se pudo cargar" description={error} />
        ) : sorted.length === 0 ? (
          <EmptyState title="Sin clientes" description="Crea el primer cliente." />
        ) : (
          <Table>
            <THead>
              <tr>
                <TH>ID</TH>
                <TH>Nombre</TH>
                <TH>NIT</TH>
                <TH>Ubicación</TH>
                <TH>Estado</TH>
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
                  <TD>
                    <StatusBadge>{String(x.estado ?? 'ACTIVO')}</StatusBadge>
                  </TD>
                  <TD className="text-right">
                    <div className="flex flex-wrap items-center justify-end gap-2">
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
                      {esAdmin ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="rounded-xl border-zinc-200"
                          onClick={() =>
                            setEstado(x.id, esActivo(x.estado) ? 'INACTIVO' : 'ACTIVO')
                          }
                        >
                          {esActivo(x.estado) ? 'Desactivar' : 'Activar'}
                        </Button>
                      ) : null}
                    </div>
                  </TD>
                </tr>
              ))}
            </TBody>
          </Table>
        )}
      </div>

      <Modal open={open} title={editing ? 'Editar cliente' : 'Nuevo cliente'} onClose={() => setOpen(false)}>
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
