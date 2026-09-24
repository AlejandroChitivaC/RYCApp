import { useMemo } from 'react'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { StatusBadge } from '../../../shared/ui/StatusBadge'
import { Table, TBody, TD, TH, THead } from '../../../shared/ui/Table'
import { fmtDay, fmtMoneyCop } from '../../../shared/utils/format'
import type { SiigoFactura } from '../types'

const ESTADO_PAGO: Record<string, string> = {
  PAGADO: 'Pagado',
  PENDIENTE: 'Pendiente',
  VENCIDO: 'Vencido',
}

function sortKey(f: SiigoFactura) {
  return f.fecha ?? f.fechaSincronizacion?.slice(0, 10) ?? ''
}

function nombreFactura(f: SiigoFactura) {
  if (f.numero) return f.numero
  if (f.prefijo && f.siigoInvoiceId) return `${f.prefijo}`
  return f.siigoInvoiceId
}

type Props = {
  facturas: SiigoFactura[]
}

export function SiigoFacturasTable({ facturas }: Props) {
  const ordered = useMemo(
    () =>
      [...facturas].sort((a, b) => {
        const byDate = sortKey(b).localeCompare(sortKey(a))
        if (byDate !== 0) return byDate
        return b.id.localeCompare(a.id)
      }),
    [facturas],
  )

  if (ordered.length === 0) {
    return (
      <EmptyState
        title="Aún no hay facturas"
        description="Ejecuta «Sincronizar ahora» para traer las facturas de venta desde Siigo."
      />
    )
  }

  return (
    <div>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h3 className="text-sm font-extrabold text-brand-dark">Facturas sincronizadas</h3>
          <p className="mt-0.5 text-xs text-zinc-500">
            De la más reciente a la más antigua, según la fecha de la factura en Siigo.
          </p>
        </div>
        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-bold text-zinc-600">
          {ordered.length} {ordered.length === 1 ? 'factura' : 'facturas'}
        </span>
      </div>

      <Table>
        <THead>
          <tr>
            <TH>Factura</TH>
            <TH>Fecha</TH>
            <TH>Vence</TH>
            <TH>Cliente</TH>
            <TH className="text-right">Total</TH>
            <TH className="text-right">Saldo</TH>
            <TH>Estado</TH>
            <TH>Operación</TH>
          </tr>
        </THead>
        <TBody>
          {ordered.map((f) => (
            <tr key={f.id} className="hover:bg-brand-yellow/[0.06]">
              <TD>
                <div className="font-extrabold text-brand-dark">{nombreFactura(f)}</div>
                {f.prefijo && f.numero && !f.numero.startsWith(f.prefijo) ? (
                  <div className="text-[11px] font-medium text-zinc-400">{f.prefijo}</div>
                ) : null}
              </TD>
              <TD className="whitespace-nowrap tabular-nums">{fmtDay(f.fecha)}</TD>
              <TD className="whitespace-nowrap tabular-nums">{fmtDay(f.fechaVencimiento)}</TD>
              <TD>
                <div className="max-w-[180px] truncate font-medium" title={f.nombreCliente ?? undefined}>
                  {f.nombreCliente ?? '—'}
                </div>
                <div className="text-[11px] tabular-nums text-zinc-500">
                  {f.identificacionCliente ?? 'Sin NIT'}
                </div>
              </TD>
              <TD className="whitespace-nowrap text-right font-extrabold tabular-nums">
                {fmtMoneyCop(f.total)}
              </TD>
              <TD className="whitespace-nowrap text-right tabular-nums text-zinc-700">
                {fmtMoneyCop(f.saldo)}
              </TD>
              <TD>
                <StatusBadge>{ESTADO_PAGO[f.estadoPago] ?? f.estadoPago}</StatusBadge>
              </TD>
              <TD>
                {f.operacionId != null ? (
                  <span className="inline-flex rounded-full bg-brand-yellow/20 px-2 py-1 text-xs font-bold text-brand-dark ring-1 ring-brand-yellow/50">
                    #{f.operacionId}
                  </span>
                ) : (
                  <span className="text-xs font-medium text-zinc-400">Sin vincular</span>
                )}
              </TD>
            </tr>
          ))}
        </TBody>
      </Table>
    </div>
  )
}
