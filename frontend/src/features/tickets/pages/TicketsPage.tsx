import { useEffect, useMemo, useState } from 'react'
import { useLayoutSearch } from '../../../app/shell/LayoutSearchContext'
import { Button } from '../../../shared/ui/Button'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { Modal } from '../../../shared/ui/Modal'
import { PageListToolbar } from '../../../shared/ui/PageListToolbar'
import { Select } from '../../../shared/ui/Select'
import { Table, TBody, TD, TH, THead } from '../../../shared/ui/Table'
import { useAuthStore } from '../../auth/store'
import { hasRole, ROLES_TICKETS_AUDITORIA, ROLES_TICKETS_CARGA, ROLES_TICKETS_CONSULTA } from '../../auth/roles'
import { useOperacionesStore } from '../../operaciones/store'
import { TicketForm } from '../components/TicketForm'
import { TicketDetailModal } from '../components/TicketDetailModal'
import { useTicketsStore } from '../store'
import type { Ticket, TicketAuditoria } from '../types'
import { fmtBytes, fmtDate } from '../../../shared/utils/format'

function matchesTicket(t: Ticket, q: string) {
  const s = q.trim().toLowerCase()
  if (!s) return true
  return (
    String(t.id).includes(s) ||
    String(t.operacionId).includes(s) ||
    (t.numeroTicket ?? '').toLowerCase().includes(s) ||
    t.nombreArchivoOriginal.toLowerCase().includes(s) ||
    fmtDate(t.fechaCarga).toLowerCase().includes(s)
  )
}

function matchesAuditoria(a: TicketAuditoria, q: string) {
  const s = q.trim().toLowerCase()
  if (!s) return true
  return (
    String(a.ticketId).includes(s) ||
    a.usuarioNombre.toLowerCase().includes(s) ||
    a.usuarioApellido.toLowerCase().includes(s) ||
    a.accion.toLowerCase().includes(s) ||
    fmtDate(a.fechaAccion).toLowerCase().includes(s)
  )
}

export function TicketsPage() {
  const user = useAuthStore((s) => s.user)

  const puedeCargar = hasRole(user?.rol, ROLES_TICKETS_CARGA)
  const puedeConsultar = hasRole(user?.rol, ROLES_TICKETS_CONSULTA)
  const puedeVerAuditoria = hasRole(user?.rol, ROLES_TICKETS_AUDITORIA)

  const items = useTicketsStore((s) => s.items)
  const auditoria = useTicketsStore((s) => s.auditoria)
  const isLoading = useTicketsStore((s) => s.isLoading)
  const isLoadingAuditoria = useTicketsStore((s) => s.isLoadingAuditoria)
  const error = useTicketsStore((s) => s.error)
  const filterOperacionId = useTicketsStore((s) => s.filterOperacionId)
  const setFilterOperacionId = useTicketsStore((s) => s.setFilterOperacionId)
  const fetchAll = useTicketsStore((s) => s.fetchAll)
  const fetchAuditoria = useTicketsStore((s) => s.fetchAuditoria)
  const cargar = useTicketsStore((s) => s.cargar)
  const descargarPdf = useTicketsStore((s) => s.descargarPdf)

  const operacionesItems = useOperacionesStore((s) => s.items)
  const fetchOperaciones = useOperacionesStore((s) => s.fetchAll)

  const [open, setOpen] = useState(false)
  const [detailTicketId, setDetailTicketId] = useState<number | null>(null)
  const [tab, setTab] = useState<'tickets' | 'auditoria'>('tickets')
  const { query: layoutQuery } = useLayoutSearch()
  const [tableQuery, setTableQuery] = useState('')

  useEffect(() => {
    fetchOperaciones()
    if (puedeConsultar) fetchAll()
    if (puedeVerAuditoria) fetchAuditoria()
  }, [fetchOperaciones, fetchAll, fetchAuditoria, puedeConsultar, puedeVerAuditoria])

  const filteredTickets = useMemo(
    () =>
      items.filter(
        (t) => matchesTicket(t, layoutQuery) && matchesTicket(t, tableQuery),
      ),
    [items, layoutQuery, tableQuery],
  )

  const filteredAuditoria = useMemo(
    () =>
      auditoria.filter(
        (a) => matchesAuditoria(a, layoutQuery) && matchesAuditoria(a, tableQuery),
      ),
    [auditoria, layoutQuery, tableQuery],
  )

  return (
    <div>
      <PageListToolbar
        title="Tickets digitales"
        description="Comprobantes de operaciones almacenados como PDF. Filtra por operación o búsqueda libre."
        tableSearch={{ value: tableQuery, onChange: setTableQuery }}
        action={
          puedeCargar ? (
            <Button className="rounded-xl px-5" onClick={() => setOpen(true)}>
              + Cargar ticket
            </Button>
          ) : undefined
        }
      />

      {puedeConsultar ? (
        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Select
              label="Filtrar por operación"
              value={filterOperacionId}
              onChange={(e) => setFilterOperacionId(e.target.value)}
            >
              <option value="">Todas las operaciones</option>
              {operacionesItems.map((o) => (
                <option key={o.id} value={o.id}>
                  #{o.id} — {new Date(o.fechaInsercion).toLocaleDateString()} · ${o.valor}
                </option>
              ))}
            </Select>
          </div>
          <div className="lg:col-span-8 flex flex-wrap items-end gap-2">
            <Button
              variant="secondary"
              className="rounded-xl border-zinc-200"
              onClick={() => fetchAll()}
              loading={isLoading}
              size="sm"
            >
              Aplicar filtro
            </Button>
            <Button
              variant="secondary"
              className="rounded-xl border-zinc-200"
              onClick={() => {
                setFilterOperacionId('')
                setTimeout(() => fetchAll(), 0)
              }}
              size="sm"
            >
              Limpiar
            </Button>
          </div>
        </div>
      ) : null}

      {puedeVerAuditoria && (
        <div className="mt-4 flex gap-1 rounded-xl border border-zinc-200 bg-zinc-50 p-1 w-fit">
          {(['tickets', 'auditoria'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={[
                'rounded-lg px-4 py-1.5 text-sm font-semibold transition',
                tab === t
                  ? 'bg-white text-brand-dark shadow ring-1 ring-zinc-200'
                  : 'text-zinc-500 hover:text-zinc-800',
              ].join(' ')}
            >
              {t === 'tickets' ? 'Tickets' : 'Auditoría'}
            </button>
          ))}
        </div>
      )}

      <div className="mt-6">
        {tab === 'tickets' ? (
          !puedeConsultar ? (
            <EmptyState
              title="Carga de tickets"
              description="Usa el botón «Cargar ticket» para asociar comprobantes a una operación. La consulta y descarga de tickets está reservada a administración y contabilidad."
            />
          ) : isLoading ? (
            <div className="h-40 w-full animate-pulse rounded-2xl bg-zinc-100" />
          ) : error ? (
            <EmptyState title="No se pudo cargar" description={error} />
          ) : items.length === 0 ? (
            <EmptyState
              title="Sin tickets"
              description="No hay tickets registrados. Carga el primero con el botón superior."
            />
          ) : filteredTickets.length === 0 ? (
            <EmptyState title="Sin coincidencias" description="Ajusta los filtros o la búsqueda." />
          ) : (
            <Table>
              <THead>
                <tr>
                  <TH>ID</TH>
                  <TH>Operación</TH>
                  <TH>N° Ticket</TH>
                  <TH>Archivo original</TH>
                  <TH>Tipo</TH>
                  <TH>Tamaño</TH>
                  <TH>Fecha carga</TH>
                  {puedeConsultar ? <TH className="text-right">Acciones</TH> : null}
                </tr>
              </THead>
              <TBody>
                {filteredTickets.map((t) => (
                  <tr key={t.id} className="hover:bg-brand-yellow/[0.06]">
                    <TD>{t.id}</TD>
                    <TD>
                      <span className="inline-flex rounded-full bg-brand-yellow/20 px-2 py-1 text-xs font-bold text-brand-dark ring-1 ring-brand-yellow/50">
                        #{t.operacionId}
                      </span>
                    </TD>
                    <TD>{t.numeroTicket ?? '—'}</TD>
                    <TD className="max-w-[180px] truncate">
                      <span title={t.nombreArchivoOriginal}>{t.nombreArchivoOriginal}</span>
                    </TD>
                    <TD>{t.tipoContenidoOriginal}</TD>
                    <TD>{fmtBytes(t.tamanoBytesOriginal)}</TD>
                    <TD>{fmtDate(t.fechaCarga)}</TD>
                    {puedeConsultar ? (
                      <TD className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="rounded-lg text-xs"
                            onClick={() => setDetailTicketId(t.id)}
                          >
                            Ver
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="rounded-lg text-xs"
                            onClick={async () => {
                              await descargarPdf(t.id, t.nombreArchivoOriginal)
                              if (puedeVerAuditoria) await fetchAuditoria()
                            }}
                          >
                            Descargar
                          </Button>
                        </div>
                      </TD>
                    ) : null}
                  </tr>
                ))}
              </TBody>
            </Table>
          )
        ) : (
          isLoadingAuditoria ? (
            <div className="h-40 w-full animate-pulse rounded-2xl bg-zinc-100" />
          ) : auditoria.length === 0 ? (
            <EmptyState title="Sin registros de auditoría" description="Aún no hay acciones registradas." />
          ) : filteredAuditoria.length === 0 ? (
            <EmptyState title="Sin coincidencias" description="Ajusta la búsqueda." />
          ) : (
            <Table>
              <THead>
                <tr>
                  <TH>ID</TH>
                  <TH>Ticket</TH>
                  <TH>Usuario</TH>
                  <TH>Fecha acción</TH>
                  <TH>Acción</TH>
                </tr>
              </THead>
              <TBody>
                {filteredAuditoria.map((a) => (
                  <tr key={a.id} className="hover:bg-brand-yellow/[0.06]">
                    <TD>{a.id}</TD>
                    <TD>#{a.ticketId}</TD>
                    <TD>{a.usuarioNombre} {a.usuarioApellido}</TD>
                    <TD>{fmtDate(a.fechaAccion)}</TD>
                    <TD>
                      <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                        {a.accion}
                      </span>
                    </TD>
                  </tr>
                ))}
              </TBody>
            </Table>
          )
        )}
      </div>

      <Modal open={open} title="Cargar ticket digital" onClose={() => setOpen(false)}>
        <TicketForm
          operaciones={operacionesItems}
          onCancel={() => setOpen(false)}
          onSubmit={async (formData) => {
            await cargar(formData)
            setOpen(false)
            if (puedeVerAuditoria) await fetchAuditoria()
          }}
        />
      </Modal>

      <TicketDetailModal
        ticketId={detailTicketId}
        puedeVerAuditoria={puedeVerAuditoria}
        onClose={() => {
          setDetailTicketId(null)
          if (puedeVerAuditoria) void fetchAuditoria()
        }}
        onDescargar={async (id, nombre) => {
          await descargarPdf(id, nombre)
          if (puedeVerAuditoria) await fetchAuditoria()
        }}
      />
    </div>
  )
}
