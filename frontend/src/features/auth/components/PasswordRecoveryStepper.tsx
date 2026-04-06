import type { ReactNode } from 'react'

type Phase = 'request' | 'reset'

type StepDef = {
  step: 1 | 2 | 3
  title: string
  subtitle: string
  icon: ReactNode
}

function IconMail() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 6h16v12H4V6Z" strokeLinejoin="round" />
      <path d="m4 7 8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconSend() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 2 11 13" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 2 15 22l-4-9-9-4 20-7Z" strokeLinejoin="round" />
    </svg>
  )
}

function IconKey() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="7.5" cy="15.5" r="4.5" />
      <path d="M21 2l-4.35 4.35M12 12l-1 1 2 2 1-1" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m10 14 8.5-8.5a2.12 2.12 0 0 1 3 3L14 17" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const STEPS: StepDef[] = [
  {
    step: 1,
    title: 'PASO 1: Ingresa tu correo',
    subtitle: 'Correo verificado en el sistema',
    icon: <IconMail />,
  },
  {
    step: 2,
    title: 'PASO 2: Recibe el código',
    subtitle: 'OTP válido por 2 minutos',
    icon: <IconSend />,
  },
  {
    step: 3,
    title: 'PASO 3: Nueva contraseña',
    subtitle: 'Ingresa el OTP recibido y crea una contraseña segura',
    icon: <IconKey />,
  },
]

function stepState(phase: Phase, step: 1 | 2 | 3): 'upcoming' | 'current' | 'done' {
  if (phase === 'request') {
    if (step === 1) return 'current'
    return 'upcoming'
  }
  /* reset: correo enviado → pasos 1 y 2 cumplidos; mismo formulario para OTP + nueva clave */
  if (step === 1 || step === 2) return 'done'
  return 'current'
}

/**
 * Alineado al flujo real: correo verificado → OTP corto → nueva contraseña.
 */
export function PasswordRecoveryStepper({ phase }: { phase: Phase }) {
  return (
    <div>
      <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-zinc-500">
        Proceso de recuperación
      </p>
      <ul className="mt-5 space-y-0">
        {STEPS.map((s, i) => {
          const st = stepState(phase, s.step)
          const isDone = st === 'done'
          const isCurrent = st === 'current'
          const isUpcoming = st === 'upcoming'

          return (
            <li key={s.step} className="relative flex gap-4 pb-6 last:pb-0">
              {i < STEPS.length - 1 ? (
                <div
                  className={[
                    'absolute left-[1.125rem] top-9 h-[calc(100%-0.75rem)] w-px',
                    phase === 'reset' ? 'bg-brand-yellow/35' : 'bg-zinc-700/80',
                  ].join(' ')}
                  aria-hidden
                />
              ) : null}
              <div className="relative z-10 flex shrink-0 flex-col items-center">
                <div
                  className={[
                    'grid h-9 w-9 place-items-center rounded-full text-xs font-extrabold ring-2',
                    isDone
                      ? 'bg-brand-yellow/90 text-brand-dark ring-brand-yellow/50'
                      : isCurrent
                        ? 'bg-brand-yellow text-brand-dark ring-brand-yellow/60 shadow-md shadow-brand-yellow/15'
                        : 'bg-zinc-800 text-zinc-500 ring-zinc-600',
                  ].join(' ')}
                >
                  {isDone ? '✓' : s.step}
                </div>
              </div>
              <div
                className={[
                  'min-w-0 flex-1 rounded-xl border px-3 py-3 sm:px-4',
                  isCurrent
                    ? 'border-brand-yellow/35 bg-black/30 shadow-sm ring-1 ring-brand-yellow/15'
                    : isDone
                      ? 'border-white/[0.06] bg-black/25 opacity-90'
                      : 'border-white/[0.06] bg-black/20 opacity-50',
                ].join(' ')}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={[
                      'mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg',
                      isCurrent || isDone ? 'bg-brand-yellow/25 text-brand-yellow' : 'bg-zinc-800/90 text-zinc-500',
                    ].join(' ')}
                  >
                    {s.icon}
                  </span>
                  <div>
                    <p
                      className={[
                        'text-sm font-bold',
                        isUpcoming ? 'text-zinc-500' : 'text-white',
                      ].join(' ')}
                    >
                      {s.title}
                    </p>
                    <p className="mt-1 text-xs leading-snug text-zinc-500">{s.subtitle}</p>
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
