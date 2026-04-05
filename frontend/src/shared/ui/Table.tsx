import type { PropsWithChildren } from 'react'

export function Table({ children }: PropsWithChildren) {
  return (
    <div className="overflow-hidden rounded-2xl border-2 border-zinc-200 bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-200">{children}</table>
      </div>
    </div>
  )
}

export function THead({ children }: PropsWithChildren) {
  return (
    <thead className="sticky top-0 bg-brand-dark text-white">
      {children}
    </thead>
  )
}

export function TH({ children }: PropsWithChildren) {
  return (
    <th className="border-b-2 border-brand-yellow px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-white">
      {children}
    </th>
  )
}

export function TBody({ children }: PropsWithChildren) {
  return <tbody className="divide-y divide-zinc-100">{children}</tbody>
}

export function TD({ children }: PropsWithChildren) {
  return (
    <td className="px-4 py-3 text-sm text-brand-dark">{children}</td>
  )
}
