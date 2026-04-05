export function EmptyState({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50/80 p-8 text-center shadow-inner">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-yellow text-brand-dark shadow-brand ring-2 ring-brand-dark/10">
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none">
          <path
            d="M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M9 8h6M9 12h6M9 16h5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="mt-4 text-sm font-extrabold text-brand-dark">{title}</div>
      {description ? (
        <div className="mt-1 text-sm text-brand-muted">{description}</div>
      ) : null}
    </div>
  )
}
