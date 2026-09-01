type Point = { label: string; value: number }

function maxOf(points: Point[]) {
  return Math.max(1, ...points.map((p) => p.value))
}

export function BarChart({
  points,
  valueFormatter,
  barClass = 'fill-brand-yellow',
}: {
  points: Point[]
  valueFormatter?: (n: number) => string
  barClass?: string
}) {
  const w = 640
  const h = 220
  const padL = 44
  const padR = 12
  const padT = 16
  const padB = 36
  const innerW = w - padL - padR
  const innerH = h - padT - padB
  const max = maxOf(points)
  const gap = 8
  const barW = points.length === 0 ? innerW : Math.max(8, (innerW - gap * points.length) / points.length)

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-56 w-full" role="img">
      <line x1={padL} y1={padT} x2={padL} y2={h - padB} className="stroke-zinc-200" strokeWidth="1" />
      <line x1={padL} y1={h - padB} x2={w - padR} y2={h - padB} className="stroke-zinc-200" strokeWidth="1" />
      {points.map((p, i) => {
        const bh = (p.value / max) * innerH
        const x = padL + i * (barW + gap) + gap / 2
        const y = h - padB - bh
        return (
          <g key={`${p.label}-${i}`}>
            <rect x={x} y={y} width={barW} height={Math.max(bh, 1)} rx="6" className={barClass} />
            <text
              x={x + barW / 2}
              y={h - padB + 14}
              textAnchor="middle"
              className="fill-zinc-500 text-[10px]"
            >
              {p.label}
            </text>
            <title>{`${p.label}: ${valueFormatter ? valueFormatter(p.value) : p.value}`}</title>
          </g>
        )
      })}
    </svg>
  )
}

export function LineChart({
  series,
}: {
  series: { name: string; color: string; points: Point[] }[]
}) {
  const w = 640
  const h = 220
  const padL = 12
  const padR = 12
  const padT = 16
  const padB = 36
  const innerW = w - padL - padR
  const innerH = h - padT - padB
  const labels = series[0]?.points.map((p) => p.label) ?? []
  const max = Math.max(
    1,
    ...series.flatMap((s) => s.points.map((p) => p.value)),
  )
  const n = Math.max(1, labels.length - 1)

  function pathFor(points: Point[]) {
    return points
      .map((p, i) => {
        const x = padL + (i / n) * innerW
        const y = h - padB - (p.value / max) * innerH
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
      })
      .join(' ')
  }

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-56 w-full" role="img">
      <line x1={padL} y1={h - padB} x2={w - padR} y2={h - padB} className="stroke-zinc-200" strokeWidth="1" />
      {series.map((s) => (
        <g key={s.name}>
          <path d={pathFor(s.points)} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinejoin="round" />
          {s.points.map((p, i) => {
            const x = padL + (i / n) * innerW
            const y = h - padB - (p.value / max) * innerH
            return <circle key={`${s.name}-${i}`} cx={x} cy={y} r="3.5" fill={s.color} />
          })}
        </g>
      ))}
      {labels.map((label, i) => {
        const x = padL + (i / n) * innerW
        return (
          <text key={label} x={x} y={h - padB + 14} textAnchor="middle" className="fill-zinc-500 text-[10px]">
            {label}
          </text>
        )
      })}
    </svg>
  )
}
