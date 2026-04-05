import type { TextareaHTMLAttributes } from 'react'

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string
  error?: string
}

export function Textarea({ label, error, className, ...props }: Props) {
  return (
    <label className="block">
      <div className="text-xs font-semibold text-brand-dark">{label}</div>
      <textarea
        {...props}
        className={[
          'mt-1 w-full resize-none rounded-xl border-2 border-zinc-200 bg-white px-3 py-2 text-sm text-brand-dark shadow-sm outline-none transition',
          error
            ? 'border-rose-400 focus:ring-2 focus:ring-rose-100'
            : 'focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/25',
          className ?? '',
        ].join(' ')}
      />
      {error ? <div className="mt-1 text-xs text-rose-600">{error}</div> : null}
    </label>
  )
}

