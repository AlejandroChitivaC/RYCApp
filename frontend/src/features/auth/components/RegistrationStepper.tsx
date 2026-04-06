import type { ReactNode } from 'react'

type Step = {
  step: number
  title: string
  description: string
  icon: ReactNode
}

const STEPS: Step[] = [
  {
    step: 1,
    title: 'Crea tu cuenta',
    description: 'Completa el formulario con tus datos.',
    icon: <StepIconUser />,
  },
  {
    step: 2,
    title: 'Verifica tu correo',
    description: 'Ingresa el código OTP (válido 2 minutos).',
    icon: <StepIconMail />,
  },
  {
    step: 3,
    title: 'Aprobación administrador',
    description: 'Tu cuenta queda en revisión hasta que un admin asigne rol.',
    icon: <StepIconAdmin />,
  },
  {
    step: 4,
    title: 'Notificación',
    description: 'Te avisamos por correo cuando puedas iniciar sesión.',
    icon: <StepIconBell />,
  },
]

function StepIconUser() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0Z" />
      <path d="M4 20a8 8 0 0 1 16 0" strokeLinecap="round" />
    </svg>
  )
}

function StepIconMail() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 6h16v12H4V6Z" strokeLinejoin="round" />
      <path d="m4 7 8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function StepIconAdmin() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20a6 6 0 0 1 12 0" strokeLinecap="round" />
      <path d="M16 11h5v6h-5" strokeLinejoin="round" />
      <path d="M18.5 14h2" strokeLinecap="round" />
    </svg>
  )
}

function StepIconBell() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 18H6a2 2 0 0 1-2-2V9a6 6 0 1 1 12 0v7a2 2 0 0 1-2 2Z" strokeLinejoin="round" />
      <path d="M10 21h4" strokeLinecap="round" />
    </svg>
  )
}

/**
 * Pasos alineados al flujo real: registro → OTP (2 min) → PENDIENTE_APROBACION / activación admin → aviso por correo.
 */
export function RegistrationStepper({ activeStep }: { activeStep: 1 | 2 | 3 | 4 }) {
  return (
    <div>
      <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-brand-yellow">Proceso de registro</p>
      <ul className="mt-5 space-y-0">
        {STEPS.map((s, i) => {
          const isActive = s.step === activeStep
          const isPast = s.step < activeStep
          return (
            <li key={s.step} className="relative flex gap-4 pb-8 last:pb-0">
              {i < STEPS.length - 1 ? (
                <div
                  className={[
                    'absolute left-[1.125rem] top-9 h-[calc(100%-0.5rem)] w-px',
                    isPast ? 'bg-brand-yellow/50' : 'bg-zinc-700/80',
                  ].join(' ')}
                  aria-hidden
                />
              ) : null}
              <div className="relative z-10 flex shrink-0 flex-col items-center">
                <div
                  className={[
                    'grid h-9 w-9 place-items-center rounded-full text-xs font-extrabold ring-2',
                    isActive
                      ? 'bg-brand-yellow text-brand-dark ring-brand-yellow/60 shadow-md shadow-brand-yellow/20'
                      : isPast
                        ? 'bg-brand-yellow/20 text-brand-yellow ring-brand-yellow/30'
                        : 'bg-zinc-800 text-zinc-500 ring-zinc-600',
                  ].join(' ')}
                >
                  {isPast ? '✓' : s.step}
                </div>
              </div>
              <div
                className={[
                  'min-w-0 flex-1 rounded-xl border px-3 py-3 sm:px-4',
                  isActive
                    ? 'border-brand-yellow/40 bg-brand-yellow/[0.07] shadow-sm shadow-black/20'
                    : 'border-white/[0.06] bg-black/20',
                ].join(' ')}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={[
                      'mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full',
                      isActive ? 'bg-brand-yellow/25 text-brand-yellow' : 'bg-zinc-800/80 text-zinc-500',
                    ].join(' ')}
                  >
                    {s.icon}
                  </span>
                  <div>
                    <p className={`font-bold ${isActive ? 'text-white' : 'text-zinc-400'}`}>{s.title}</p>
                    <p className="mt-1 text-sm leading-snug text-zinc-500">{s.description}</p>
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
