// Pezzi di disegno riusati da più illustrazioni (tutti SVG semplici, colori passati da fuori).

/** Scintilla a quattro punte centrata in (x, y). */
export function Sparkle({ x, y, size, fill }: { x: number; y: number; size: number; fill: string }) {
  const s = size
  const d = `M0 ${-s}Q${s * 0.18} ${-s * 0.18} ${s} 0Q${s * 0.18} ${s * 0.18} 0 ${s}Q${-s * 0.18} ${s * 0.18} ${-s} 0Q${-s * 0.18} ${-s * 0.18} 0 ${-s}Z`
  return <path d={d} transform={`translate(${x} ${y})`} fill={fill} />
}

/** Collina morbida: una curva che parte da sinistra e riempie fino al fondo. */
export function Hill({ y, amp, fill, phase = 0, w = 400, h = 240 }: { y: number; amp: number; fill: string; phase?: number; w?: number; h?: number }) {
  const d = `M0 ${y}C${w * 0.25} ${y - amp * (1 + phase)} ${w * 0.5} ${y + amp * (1 - phase)} ${w * 0.75} ${y - amp * 0.4}S${w} ${y + amp * 0.3} ${w} ${y}V${h}H0Z`
  return <path d={d} fill={fill} />
}

/** Sole con alone morbido. */
export function Sun({ x, y, r, fill, halo = 0.28 }: { x: number; y: number; r: number; fill: string; halo?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r * 1.7} fill={fill} opacity={halo * 0.6} />
      <circle cx={x} cy={y} r={r * 1.3} fill={fill} opacity={halo} />
      <circle cx={x} cy={y} r={r} fill={fill} />
    </g>
  )
}

/** Pino stilizzato a tre piani. */
export function Pine({ x, y, s, fill, trunk }: { x: number; y: number; s: number; fill: string; trunk: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-3" y="-4" width="6" height="12" rx="2" fill={trunk} />
      <path d="M0-52L16-24H-16Z M0-38L20-8H-20Z M0-22L24 6H-24Z" fill={fill} />
    </g>
  )
}

/** Albero tondo, per i parchi. */
export function RoundTree({ x, y, s, fill, trunk }: { x: number; y: number; s: number; fill: string; trunk: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-4" y="-10" width="8" height="30" rx="3" fill={trunk} />
      <circle cx="0" cy="-30" r="24" fill={fill} />
      <circle cx="-16" cy="-18" r="16" fill={fill} />
      <circle cx="17" cy="-20" r="15" fill={fill} />
    </g>
  )
}

/** Fila di lucine appese: filo curvo e lampadine. */
export function StringLights({ y, colors, count, sag = 18, w = 400 }: { y: number; colors: readonly string[]; count: number; sag?: number; w?: number }) {
  const bulbs = Array.from({ length: count }, (_, i) => {
    const t = (i + 0.5) / count
    return { x: t * w, y: y + 4 * sag * t * (1 - t) + 4, c: colors[i % colors.length] }
  })
  return (
    <g>
      <path d={`M-4 ${y}Q${w / 2} ${y + sag * 2} ${w + 4} ${y}`} fill="none" stroke="#2B2118" strokeWidth="1.6" opacity="0.55" />
      {bulbs.map((b) => (
        <g key={b.x}>
          <circle cx={b.x} cy={b.y + 4} r="9" fill={b.c} opacity="0.3" />
          <circle cx={b.x} cy={b.y + 4} r="4.5" fill={b.c} />
        </g>
      ))}
    </g>
  )
}
