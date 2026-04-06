import type { ReactNode } from 'react'
import logoUrl from '../../../assets/logo.png'

/** Panel izquierdo: logo grande + marca (mock “logo bien bonito”). */
export function AuthLogoHero({ className }: { className?: string }) {
  return (
    <div className={['flex flex-wrap items-center gap-4 sm:gap-5', className ?? ''].join(' ')}>
      <div className="grid h-[4.5rem] w-[4.5rem] shrink-0 place-items-center overflow-hidden rounded-2xl bg-brand-yellow p-2.5 shadow-xl shadow-brand-yellow/25 ring-2 ring-brand-yellow/50 sm:h-[5.25rem] sm:w-[5.25rem] sm:rounded-[1.15rem] sm:p-3">
        <img src={logoUrl} alt="R&C Transportes" className="h-full w-full object-contain drop-shadow-sm" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.28em] text-brand-yellow sm:text-xs">
          R&amp;C Transportes
        </p>
        <p className="mt-0.5 text-lg font-extrabold leading-tight text-white sm:text-xl">R&amp;C</p>
      </div>
    </div>
  )
}

const PLUS_GRID_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'%3E%3Cpath stroke='%23ffffff' stroke-opacity='0.11' stroke-width='1' d='M14 6v16M6 14h16'/%3E%3C/svg%3E"

export function AuthSplitLayout({
  left,
  right,
  leftClassName,
  rightVariant = 'dark',
  leftPlusPattern = false,
}: {
  left: ReactNode
  right: ReactNode
  leftClassName?: string
  /** Panel derecho claro (p. ej. recuperar contraseña). */
  rightVariant?: 'dark' | 'light'
  /** Patrón sutil de cruces en el panel izquierdo. */
  leftPlusPattern?: boolean
}) {
  const mainBg = rightVariant === 'light' ? 'bg-brand-page' : 'bg-[#121212]'

  return (
    <div
      className={[
        'flex min-h-[100dvh] flex-col lg:flex-row',
        rightVariant === 'light' ? 'bg-brand-page lg:bg-[#121212]' : 'bg-[#121212]',
      ].join(' ')}
    >
      <aside
        className={[
          'relative flex min-h-0 w-full flex-col border-b border-white/[0.06] px-6 py-8 sm:px-8 sm:py-10 lg:w-1/2 lg:max-w-none lg:shrink-0 lg:border-b-0 lg:border-r lg:border-white/[0.06] lg:px-10 lg:py-12 xl:px-12',
          leftClassName ?? '',
        ].join(' ')}
        style={{
          background:
            'radial-gradient(ellipse 100% 70% at 0% 0%, rgba(245,158,11,0.18), transparent 50%), radial-gradient(ellipse 120% 80% at 0% 0%, rgba(245,184,0,0.12), transparent 55%), linear-gradient(165deg, #1c1c1c 0%, #141414 45%, #121212 100%)',
        }}
      >
        {leftPlusPattern ? (
          <div
            className="pointer-events-none absolute inset-0 z-0 opacity-90"
            style={{
              backgroundImage: `url("${PLUS_GRID_SVG}")`,
              backgroundSize: '28px 28px',
            }}
            aria-hidden
          />
        ) : null}
        <div className="relative z-10 flex min-h-[min(420px,50vh)] flex-1 flex-col justify-between gap-10 lg:min-h-0">
          {left}
        </div>
      </aside>
      <main
        className={[
          'flex min-h-0 flex-1 flex-col justify-center px-5 py-10 sm:px-8 lg:px-12 xl:px-16 2xl:px-24',
          mainBg,
        ].join(' ')}
      >
        <div className="mx-auto w-full max-w-md">{right}</div>
      </main>
    </div>
  )
}

export function AuthFeatureCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex gap-4 rounded-2xl border border-white/[0.08] bg-black/25 p-4 shadow-sm backdrop-blur-sm ring-1 ring-white/[0.04] transition hover:border-brand-yellow/25 hover:bg-black/35">
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-yellow/20 text-brand-yellow ring-1 ring-brand-yellow/30">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="font-bold text-white">{title}</p>
        <p className="mt-1 text-sm leading-snug text-zinc-400">{description}</p>
      </div>
    </div>
  )
}

export function AuthFooterStatus({
  leftText,
  showOnline = true,
}: {
  leftText: string
  showOnline?: boolean
}) {
  return (
    <div className="flex flex-col gap-3 border-t border-white/[0.06] pt-6 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
      <p>{leftText}</p>
      {showOnline ? (
        <p className="flex items-center gap-2 font-semibold text-emerald-400/95">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/40 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          Sistema en línea
        </p>
      ) : null}
    </div>
  )
}
