import { Button } from '../../../shared/ui/Button'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { fmtDate } from '../../../shared/utils/format'
import type { SiigoLogEntry, SiigoLogLevel } from '../types'

type Props = {
  entries: SiigoLogEntry[]
  onClear: () => void
  className?: string
}

const levelStyles: Record<
  SiigoLogLevel,
  { badge: string; rail: string; label: string }
> = {
  success: {
    badge: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
    rail: 'bg-emerald-500',
    label: 'OK',
  },
  warning: {
    badge: 'bg-amber-100 text-amber-900 ring-amber-200',
    rail: 'bg-amber-500',
    label: 'AVISO',
  },
  error: {
    badge: 'bg-red-100 text-red-800 ring-red-200',
    rail: 'bg-red-500',
    label: 'ERROR',
  },
  info: {
    badge: 'bg-zinc-100 text-zinc-700 ring-zinc-200',
    rail: 'bg-zinc-400',
    label: 'INFO',
  },
}

const actionLabel: Record<SiigoLogEntry['action'], string> = {
  HEALTH: 'Autenticación',
  CONSULTA: 'Consulta',
  SYNC: 'Sincronización',
}

export function SiigoActivityLog({ entries, onClear, className }: Props) {
  return (
    <div
      className={[
        'flex h-full max-h-[32rem] min-h-0 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm',
        className ?? '',
      ].join(' ')}
    >
      <div className="flex items-center justify-between gap-3 border-b border-zinc-100 bg-zinc-50/80 px-5 py-3">
        <div>
          <div className="text-sm font-extrabold uppercase tracking-wide text-brand-dark">
            Historial de pruebas
          </div>
          <p className="mt-0.5 text-xs text-zinc-500">
            Registro visual de esta sesión (no se envía a Siigo ni se guarda en el servidor).
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="rounded-lg text-xs"
          disabled={entries.length === 0}
          onClick={onClear}
        >
          Limpiar
        </Button>
      </div>

      {entries.length === 0 ? (
        <div className="p-4">
          <EmptyState
            title="Sin registros aún"
            description="Al probar conexión o consultar la cuenta, verás aquí cada intento con hora y resultado."
          />
        </div>
      ) : (
        <ol className="min-h-0 flex-1 divide-y divide-zinc-100 overflow-y-auto">
          {entries.map((entry) => {
            const style = levelStyles[entry.level]
            return (
              <li key={entry.id} className="flex gap-3 px-5 py-3.5 hover:bg-brand-yellow/[0.04]">
                <div className={`mt-1 h-10 w-1 shrink-0 rounded-full ${style.rail}`} aria-hidden />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${style.badge}`}
                    >
                      {style.label}
                    </span>
                    <span className="text-xs font-semibold text-zinc-800">
                      {actionLabel[entry.action] ?? entry.action}
                    </span>
                    <span className="text-[11px] text-zinc-400">{fmtDate(entry.at)}</span>
                  </div>
                  <div className="mt-1 text-sm font-semibold text-zinc-900">{entry.title}</div>
                  <div className="mt-0.5 text-sm text-zinc-600">{entry.message}</div>
                  {entry.detail ? (
                    <pre className="mt-2 overflow-x-auto rounded-lg bg-zinc-50 px-3 py-2 font-mono text-[11px] leading-relaxed text-zinc-700 ring-1 ring-zinc-100">
                      {entry.detail}
                    </pre>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
