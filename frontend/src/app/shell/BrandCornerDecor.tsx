/**
 * Motivo esquina topbar: columna vertical + barras horizontales (extremos redondeados).
 * Colores marca: carbón y amarillo.
 */
export function BrandCornerDecor({ className = '' }: { className?: string }) {
  const black = '#121212'
  const yellow = '#F5B800'
  const h = 6
  const rx = h / 2
  const spineW = 9
  const spineRx = spineW / 2
  const x0 = 4
  const xBar = x0 + spineW + 5

  return (
    <svg
      className={className}
      viewBox="0 0 88 78"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* Columna vertical */}
      <rect
        x={x0}
        y="3"
        width={spineW}
        height="72"
        rx={spineRx}
        ry={spineRx}
        fill={black}
      />
      {/* Arriba: negro, longitud media */}
      <rect x={xBar} y="8" width="36" height={h} rx={rx} ry={rx} fill={black} />
      {/* Corta amarilla */}
      <rect x={xBar} y="21" width="24" height={h} rx={rx} ry={rx} fill={yellow} />
      {/* Amarilla más larga */}
      <rect x={xBar} y="34" width="52" height={h} rx={rx} ry={rx} fill={yellow} />
      {/* Corta negra */}
      <rect x={xBar} y="47" width="18" height={h} rx={rx} ry={rx} fill={black} />
      {/* Amarilla media */}
      <rect x={xBar} y="60" width="32" height={h} rx={rx} ry={rx} fill={yellow} />
    </svg>
  )
}
