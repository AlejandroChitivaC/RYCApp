import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

type Variant = 'primary' | 'secondary' | 'danger'
type Size = 'sm' | 'md'

type Props = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant
    loading?: boolean
    size?: Size
  }
>

const styles: Record<Variant, string> = {
  primary:
    'bg-brand-yellow text-brand-dark shadow-brand hover:bg-brand-yellow-bright disabled:opacity-55 disabled:shadow-none',
  secondary:
    'border-2 border-brand-dark bg-white text-brand-dark shadow-sm hover:bg-zinc-50 disabled:opacity-55',
  danger:
    'bg-red-600 text-white shadow-sm hover:bg-red-700 disabled:opacity-55',
}

const sizes: Record<Size, string> = {
  sm: 'rounded-xl px-3 py-2 text-sm',
  md: 'rounded-2xl px-4 py-2.5 text-sm',
}

export function Button({
  variant = 'primary',
  loading,
  size = 'sm',
  className,
  disabled,
  children,
  ...props
}: Props) {
  const spinnerClass =
    variant === 'primary'
      ? 'border-brand-dark/25 border-t-brand-dark'
      : 'border-white/40 border-t-white'

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center gap-2 font-bold transition focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:ring-offset-2 active:translate-y-[0.5px]',
        sizes[size],
        styles[variant],
        className ?? '',
      ].join(' ')}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span
            className={`h-4 w-4 animate-spin rounded-full border-2 ${spinnerClass}`}
          />
          <span>Procesando</span>
        </span>
      ) : (
        children
      )}
    </button>
  )
}
