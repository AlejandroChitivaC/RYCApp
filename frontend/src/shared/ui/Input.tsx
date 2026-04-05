import type { InputHTMLAttributes } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  hint?: string
}

export function Input({ label, error, hint, className, ...props }: Props) {
  return (
    <label className="block">
      <div className="text-xs font-semibold text-brand-dark">{label}</div>
      <input
        {...props}
        className={[
          'mt-1 w-full rounded-xl border-2 border-zinc-200 bg-white px-3 py-2.5 text-sm text-brand-dark shadow-sm outline-none transition placeholder:text-zinc-400',
          error
            ? 'border-rose-400 focus:ring-2 focus:ring-rose-100'
            : 'focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/25',
          className ?? '',
        ].join(' ')}
      />
      {error ? (
        <div className="mt-1 text-xs font-medium text-rose-600">{error}</div>
      ) : hint ? (
        <div className="mt-1 text-xs text-slate-500">{hint}</div>
      ) : null}
    </label>
  )
}

