import { useId, type InputHTMLAttributes, type ReactNode } from 'react'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> & {
  label: string
  leftIcon?: ReactNode
  rightSlot?: ReactNode
  inputClassName?: string
  error?: string
}

export function AuthDarkField({
  label,
  leftIcon,
  rightSlot,
  inputClassName,
  error,
  id: idProp,
  ...inputProps
}: Props) {
  const uid = useId()
  const id = idProp ?? uid
  const padL = leftIcon ? 'pl-11' : 'pl-3.5'
  const padR = rightSlot ? 'pr-11' : 'pr-3.5'
  return (
    <div className="block">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-zinc-300">
        {label}
      </label>
      <div className="relative">
        {leftIcon ? (
          <span className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-zinc-500 [&_svg]:h-[1.15rem] [&_svg]:w-[1.15rem]">
            {leftIcon}
          </span>
        ) : null}
        <input
          id={id}
          {...inputProps}
          className={[
            'w-full rounded-xl border border-zinc-700/90 bg-zinc-800/70 py-3 text-sm text-white shadow-inner outline-none transition placeholder:text-zinc-500',
            padL,
            padR,
            'focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow/45',
            error ? 'border-red-500/80 focus:border-red-500 focus:ring-red-500/30' : '',
            inputClassName ?? '',
          ].join(' ')}
        />
        {rightSlot ? (
          <span className="absolute right-2 top-1/2 z-10 -translate-y-1/2">{rightSlot}</span>
        ) : null}
      </div>
      {error ? <p className="mt-1.5 text-xs font-medium text-red-400">{error}</p> : null}
    </div>
  )
}

function IconMail() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 6h16v12H4V6Z" strokeLinejoin="round" />
      <path d="m4 7 8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconLock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="5" y="11" width="14" height="10" rx="2" strokeLinejoin="round" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" strokeLinecap="round" />
    </svg>
  )
}

function IconEye({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function IconEyeOff({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path
        d="M10.7 10.7a3 3 0 0 0 4.2 4.2M9.88 5.09A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19m-3.2 2.77a10 10 0 0 1-4.64 1.04c-6.5 0-10-7-10-7a18.6 18.6 0 0 1 5.06-6.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M2 2l20 20" strokeLinecap="round" />
    </svg>
  )
}

export function AuthMailIcon() {
  return <IconMail />
}

export function AuthLockIcon() {
  return <IconLock />
}

export function AuthPasswordToggle({
  visible,
  onToggle,
}: {
  visible: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-700/80 hover:text-white"
      aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
    >
      {visible ? <IconEyeOff className="h-5 w-5" /> : <IconEye className="h-5 w-5" />}
    </button>
  )
}

export function AuthCardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" strokeLinejoin="round" />
      <path d="M3 10h18" strokeLinecap="round" />
    </svg>
  )
}

export function AuthUserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0Z" />
      <path d="M4 20a8 8 0 0 1 16 0" strokeLinecap="round" />
    </svg>
  )
}
