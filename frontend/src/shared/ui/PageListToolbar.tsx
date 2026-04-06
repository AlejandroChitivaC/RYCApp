import type { ReactNode } from 'react'

type Props = {
  title: string
  description?: string
  action?: ReactNode
  tableSearch?: {
    value: string
    onChange: (v: string) => void
    placeholder?: string
  }
  extra?: ReactNode
}

function IconSearch({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3-3" strokeLinecap="round" />
    </svg>
  )
}

export function PageListToolbar({ title, description, action, tableSearch, extra }: Props) {
  return (
    <div className="flex flex-col gap-4 border-b border-zinc-100 pb-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-extrabold tracking-tight text-brand-dark">{title}</h2>
          {description ? <p className="mt-1 text-sm text-brand-muted">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          {tableSearch ? (
            <div className="relative min-w-[min(100%,220px)] flex-1 sm:max-w-sm">
              <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="search"
                value={tableSearch.value}
                onChange={(e) => tableSearch.onChange(e.target.value)}
                placeholder={tableSearch.placeholder ?? 'Buscar en tabla…'}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 pl-10 pr-3 text-sm text-brand-dark outline-none transition placeholder:text-zinc-400 focus:border-brand-yellow focus:bg-white focus:ring-2 focus:ring-brand-yellow/25"
                aria-label="Buscar en la tabla"
              />
            </div>
          ) : null}
          {extra}
        </div>
      </div>
    </div>
  )
}
