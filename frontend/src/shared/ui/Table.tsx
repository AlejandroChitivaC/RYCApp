import type { PropsWithChildren } from 'react'

export function Table({ children }: PropsWithChildren) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-200">{children}</table>
      </div>
    </div>
  )
}

export function THead({ children }: PropsWithChildren) {
  return <thead className="sticky top-0 bg-zinc-50/95 backdrop-blur-sm">{children}</thead>
}

export function TH({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <th
      className={[
        'whitespace-nowrap px-4 py-3.5 text-left text-[11px] font-extrabold uppercase tracking-wider text-zinc-500',
        className ?? '',
      ].join(' ')}
    >
      {children}
    </th>
  )
}

export function TBody({ children }: PropsWithChildren) {
  return <tbody className="divide-y divide-zinc-100">{children}</tbody>
}

export function TD({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <td className={['px-4 py-3.5 text-sm text-brand-dark', className ?? ''].join(' ')}>{children}</td>
  )
}
