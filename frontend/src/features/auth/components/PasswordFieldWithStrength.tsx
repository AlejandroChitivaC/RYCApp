import { useId, useState, type CSSProperties } from 'react'
import {
  getPasswordStrength,
  passwordHasDigit,
  passwordHasMinLength,
  passwordHasSpecial,
  passwordMeetsPolicy,
  strengthBarColor,
  strengthBorderClass,
} from '../passwordPolicy'

type Props = {
  label?: string
  value: string
  onChange: (value: string) => void
  autoComplete?: string
  disabled?: boolean
  /** Texto de ayuda bajo los requisitos */
  showHint?: boolean
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

function IconShield({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor" aria-hidden>
      <path d="M12 1 3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4Z" />
    </svg>
  )
}

export function PasswordFieldWithStrength({
  label = 'Contraseña',
  value,
  onChange,
  autoComplete = 'new-password',
  disabled,
  showHint = true,
}: Props) {
  const id = useId()
  const [visible, setVisible] = useState(false)
  const strength = getPasswordStrength(value)
  const barColor = strengthBarColor(strength.level)
  const borderRing = strengthBorderClass(strength.level)

  return (
    <div className="rounded-2xl bg-zinc-900 px-4 py-4 text-white shadow-inner ring-1 ring-zinc-700/80">
      <label htmlFor={id} className="block text-sm font-medium text-zinc-100">
        {label}
      </label>
      <div className="relative mt-2">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={[
            'w-full rounded-xl border-2 bg-zinc-800/90 px-3 py-2.5 pr-11 text-sm text-white outline-none transition placeholder:text-zinc-500',
            'focus:ring-2 focus:ring-brand-yellow/40',
            borderRing,
          ].join(' ')}
          placeholder="••••••••"
        />
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-700/80 hover:text-white"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          tabIndex={-1}
        >
          {visible ? <IconEyeOff className="h-5 w-5" /> : <IconEye className="h-5 w-5" />}
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs font-semibold">
        <span className="flex items-center gap-1.5" style={{ color: barColor }}>
          <IconShield className="h-4 w-4 shrink-0" style={{ color: barColor }} />
          {strength.labelEs}
        </span>
        <span className="tabular-nums" style={{ color: barColor }}>
          {strength.percent}%
        </span>
      </div>

      <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full transition-[width] duration-300 ease-out"
          style={{ width: `${strength.percent}%`, backgroundColor: barColor }}
        />
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-500">
        <span>Débil</span>
        <span>Regular</span>
        <span>Buena</span>
        <span>Fuerte</span>
      </div>

      {showHint ? (
        <ul className="mt-3 space-y-1 border-t border-zinc-700/80 pt-3 text-[11px] text-zinc-400">
          <li className={passwordHasMinLength(value) ? 'text-emerald-400' : ''}>
            {passwordHasMinLength(value) ? '✓' : '○'} Mínimo 8 caracteres
          </li>
          <li className={passwordHasDigit(value) ? 'text-emerald-400' : ''}>
            {passwordHasDigit(value) ? '✓' : '○'} Al menos un número
          </li>
          <li className={passwordHasSpecial(value) ? 'text-emerald-400' : ''}>
            {passwordHasSpecial(value) ? '✓' : '○'} Al menos un carácter especial
          </li>
        </ul>
      ) : null}
    </div>
  )
}

export { passwordMeetsPolicy }
