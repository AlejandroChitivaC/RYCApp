import { useEffect, useState } from 'react'
import { getApiErrorMessage } from '../../../app/http/apiError'
import { Button } from '../../../shared/ui/Button'
import { Table, TBody, TD, TH, THead } from '../../../shared/ui/Table'
import { fmtBytes, fmtDate } from '../../../shared/utils/format'
import { ticketsApi } from '../api'
import type { Ticket, TicketAuditoria } from '../types'

type Props = {
  ticketId: string | null
  puedeVerAuditoria: boolean
  onClose: () => void
  onDescargar: (id: string, nombreArchivo: string) => Promise<void>
}

export function TicketDetailModal({ ticketId, puedeVerAuditoria, onClose, onDescargar }: Props) {
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [auditoria, setAuditoria] = useState<TicketAuditoria[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (ticketId == null) {
      setTicket(null)
      setAuditoria([])
      setPdfUrl(null)
      return
    }

    const id = ticketId
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError('')
      try {
        const [detail, pdf, historial] = await Promise.all([
          ticketsApi.get(id),
          ticketsApi.obtenerPdf(id, 'inline'),
          puedeVerAuditoria ? ticketsApi.auditoriaPorTicket(id) : Promise.resolve([]),
        ])
        if (cancelled) return
        setTicket(detail)
        setPdfUrl(pdf.url)
        setAuditoria(historial)
      } catch (e) {
        if (!cancelled) setError(getApiErrorMessage(e))
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [ticketId, puedeVerAuditoria])

  if (ticketId == null) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm"
        onClick={onClose}
        role="button"
        tabIndex={-1}
        aria-label="Cerrar modal"
      />
      <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border-2 border-zinc-200 bg-white shadow-card">
        <div className="h-1.5 w-full bg-brand-yellow" />
        <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 sm:px-5">
          <div className="text-sm font-extrabold uppercase tracking-wide text-brand-dark">
            Ticket
          </div>
          <div className="flex items-center gap-2">
            {ticket ? (
              <Button
                size="sm"
                variant="secondary"
                className="rounded-lg text-xs"
                onClick={() => onDescargar(ticket.id, ticket.nombreArchivoOriginal)}
              >
                Descargar PDF
              </Button>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-xs font-bold text-brand-muted hover:bg-zinc-100"
            >
              Cerrar
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {isLoading ? (
            <div className="h-64 w-full animate-pulse rounded-2xl bg-zinc-100" />
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : ticket ? (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div>
                  <div className="text-xs font-semibold uppercase text-zinc-500">Operación</div>
                  <div className="font-semibold text-zinc-900">{ticket.operacionId}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase text-zinc-500">N° ticket</div>
                  <div className="font-semibold text-zinc-900">{ticket.numeroTicket ?? '—'}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase text-zinc-500">Archivo</div>
                  <div className="truncate font-semibold text-zinc-900" title={ticket.nombreArchivoOriginal}>
                    {ticket.nombreArchivoOriginal}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase text-zinc-500">Carga</div>
                  <div className="font-semibold text-zinc-900">
                    {fmtDate(ticket.fechaCarga)} · {fmtBytes(ticket.tamanoBytesOriginal)}
                  </div>
                </div>
              </div>

              {pdfUrl ? (
                <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
                  <iframe
                    title={`PDF ticket ${ticket.id}`}
                    src={pdfUrl}
                    className="h-[min(60vh,520px)] w-full bg-white"
                  />
                </div>
              ) : null}

              {puedeVerAuditoria && auditoria.length > 0 ? (
                <div>
                  <div className="mb-2 text-sm font-bold text-zinc-900">Historial del ticket</div>
                  <Table>
                    <THead>
                      <tr>
                        <TH>Fecha</TH>
                        <TH>Usuario</TH>
                        <TH>Acción</TH>
                      </tr>
                    </THead>
                    <TBody>
                      {auditoria.map((a) => (
                        <tr key={a.id}>
                          <TD>{fmtDate(a.fechaAccion)}</TD>
                          <TD>
                            {a.usuarioNombre} {a.usuarioApellido}
                          </TD>
                          <TD>
                            <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                              {a.accion}
                            </span>
                          </TD>
                        </tr>
                      ))}
                    </TBody>
                  </Table>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
