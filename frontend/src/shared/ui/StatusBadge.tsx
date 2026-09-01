type Tone = 'success' | 'neutral' | 'warning' | 'danger'

const tones: Record<Tone, string> = {
  success: 'bg-brand-success-soft text-emerald-800 ring-emerald-600/20',
  neutral: 'bg-zinc-100 text-zinc-700 ring-zinc-400/25',
  warning: 'bg-amber-100 text-amber-900 ring-amber-500/25',
  danger: 'bg-red-50 text-red-800 ring-red-500/20',
}

const dot: Record<Tone, string> = {
  success: 'bg-brand-success',
  neutral: 'bg-zinc-400',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
}

function inferTone(label: string): Tone {
  const u = label.toUpperCase()
  if (u.includes('ACTIVO') || u.includes('PAGADO') || u.includes('CONFIRMADA')) return 'success'
  if (u.includes('PENDIENTE') || u.includes('REGISTRADA')) return 'warning'
  if (u.includes('INACTIVO')) return 'neutral'
  if (u.includes('ERROR') || u.includes('BAJA') || u.includes('RECHAZ') || u.includes('VENCIDO')) return 'danger'
  return 'neutral'
}

export function StatusBadge({ children }: { children: string }) {
  const tone = inferTone(children)
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset',
        tones[tone],
      ].join(' ')}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot[tone]}`} />
      {children}
    </span>
  )
}
