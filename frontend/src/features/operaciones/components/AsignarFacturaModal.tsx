import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getApiErrorMessage } from '../../../app/http/apiError'
import { siigoApi } from '../../siigo/api'
import type { SiigoFactura } from '../../siigo/types'
import { Button } from '../../../shared/ui/Button'
import { Modal } from '../../../shared/ui/Modal'
import { Select } from '../../../shared/ui/Select'
import { fmtDay, fmtMoneyCop } from '../../../shared/utils/format'

type Props = {
  operacionId: string | null
  onClose: () => void
  onAssign: (operacionId: string, facturaId: string) => Promise<void>
}

function etiqueta(f: SiigoFactura) {
  const numero = f.numero || f.prefijo || f.siigoInvoiceId
  const cliente = f.nombreCliente || f.identificacionCliente || 'Sin cliente'
  return `${numero} · ${cliente} · ${fmtMoneyCop(f.total)}`
}

export function AsignarFacturaModal({ operacionId, onClose, onAssign }: Props) {
  const open = operacionId != null
  const [facturas, setFacturas] = useState<SiigoFactura[]>([])
  const [facturaId, setFacturaId] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (!open) {
      setFacturaId('')
      setError(null)
      return
    }
    let cancelado = false
    setCargando(true)
    setError(null)
    siigoApi
      .facturas()
      .then((data) => {
        if (!cancelado) setFacturas(data)
      })
      .catch((e) => {
        if (!cancelado) setError(getApiErrorMessage(e))
      })
      .finally(() => {
        if (!cancelado) setCargando(false)
      })
    return () => {
      cancelado = true
    }
  }, [open])

  const disponibles = useMemo(
    () =>
      facturas.filter(
        (f) => !f.operacionId || f.operacionId === operacionId,
      ),
    [facturas, operacionId],
  )

  return (
    <Modal open={open} title="Factura de Siigo" onClose={onClose}>
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          if (!operacionId || !facturaId) {
            setError('Debe seleccionar una factura de Siigo.')
            return
          }
          try {
            setGuardando(true)
            setError(null)
            await onAssign(operacionId, facturaId)
            onClose()
          } catch (err) {
            setError(getApiErrorMessage(err))
          } finally {
            setGuardando(false)
          }
        }}
      >
        <p className="text-sm text-slate-600">
          La operación ya está confirmada. Elige la factura sincronizada desde Siigo que le corresponde.
        </p>

        {cargando ? (
          <div className="mt-4 h-16 animate-pulse rounded-xl bg-zinc-100" />
        ) : error && facturas.length === 0 ? (
          <p className="mt-4 text-sm font-medium text-rose-600">{error}</p>
        ) : disponibles.length === 0 ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            No hay facturas disponibles. Sincronízalas en{' '}
            <Link to="/siigo" className="font-bold underline">
              Siigo
            </Link>
            .
          </div>
        ) : (
          <div className="mt-4">
            <Select
              label="Factura"
              value={facturaId}
              onChange={(e) => setFacturaId(e.target.value)}
              error={!facturaId ? error ?? undefined : undefined}
            >
              <option value="">Seleccione...</option>
              {disponibles.map((f) => (
                <option key={f.id} value={f.id}>
                  {etiqueta(f)}
                  {f.fecha ? ` · ${fmtDay(f.fecha)}` : ''}
                </option>
              ))}
            </Select>
            {facturaId && error ? (
              <p className="mt-2 text-xs font-medium text-rose-600">{error}</p>
            ) : null}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={guardando} disabled={disponibles.length === 0 || !facturaId}>
            Guardar
          </Button>
        </div>
      </form>
    </Modal>
  )
}
