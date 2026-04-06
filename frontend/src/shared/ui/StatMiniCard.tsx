import type { ReactNode } from 'react'

type Props = {
  icon: ReactNode
  label: string
  value: number | string
  iconBgClass?: string
}

export function StatMiniCard({
  icon,
  label,
  value,
  iconBgClass = 'bg-brand-yellow/20 text-brand-dark',
}: Props) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-sm">
      <div
        className={[
          'grid h-12 w-12 shrink-0 place-items-center rounded-xl text-lg shadow-sm ring-1 ring-black/5',
          iconBgClass,
        ].join(' ')}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-extrabold tracking-tight text-brand-dark tabular-nums">{value}</div>
        <div className="text-xs font-semibold text-brand-muted">{label}</div>
      </div>
    </div>
  )
}
