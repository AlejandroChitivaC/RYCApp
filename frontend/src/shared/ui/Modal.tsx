import type { PropsWithChildren } from 'react'

type Props = PropsWithChildren<{
  open: boolean
  title: string
  onClose: () => void
}>

export function Modal({ open, title, onClose, children }: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm"
        onClick={onClose}
        role="button"
        tabIndex={-1}
        aria-label="Cerrar modal"
      />
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border-2 border-zinc-200 bg-white shadow-card">
        <div className="h-1.5 w-full bg-brand-yellow" />
        <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 sm:px-5">
          <div className="text-sm font-extrabold uppercase tracking-wide text-brand-dark">
            {title}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-xs font-bold text-brand-muted hover:bg-zinc-100"
          >
            Cerrar
          </button>
        </div>
        <div className="p-4 sm:p-5">{children}</div>
      </div>
    </div>
  )
}
