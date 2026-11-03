import type { Rng } from '../seed'
import type { SceneProps } from './types'

const WALLS = [
  { wall: '#C9B8E8', floor: '#6F5AA8', accent: '#F2B94B' },
  { wall: '#F0C9D4', floor: '#8A4E72', accent: '#2F5D50' },
  { wall: '#D6E3D0', floor: '#4C6F5E', accent: '#E2725B' },
] as const
const ART_COLORS = ['#E2725B', '#F2B94B', '#2F5D50', '#6F5AA8', '#2F6F9A', '#FFF8F0'] as const

// Un quadro astratto: cornice scura e dentro forme colorate scelte a caso.
function Painting({ x, y, w, h, rng }: { x: number; y: number; w: number; h: number; rng: Rng }) {
  const [a, b, c] = [rng.pick(ART_COLORS), rng.pick(ART_COLORS), rng.pick(ART_COLORS)]
  return (
    <g>
      <rect x={x - 5} y={y - 5} width={w + 10} height={h + 10} rx="3" fill="#2B2118" />
      <rect x={x} y={y} width={w} height={h} fill="#FFF8F0" />
      <rect x={x} y={y} width={w} height={h * 0.55} fill={a} />
      <circle cx={x + w * rng.between(0.3, 0.7)} cy={y + h * 0.5} r={Math.min(w, h) * 0.26} fill={b} />
      <path d={`M${x} ${y + h}L${x + w * 0.45} ${y + h * 0.6}L${x + w} ${y + h}Z`} fill={c} />
    </g>
  )
}

export function Mostra({ rng, uid }: SceneProps) {
  const room = rng.pick(WALLS)
  const wide = rng.int(2) === 0
  return (
    <g>
      <defs>
        <linearGradient id={`${uid}-spot`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.55" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="400" height="240" fill={room.wall} />
      <rect y="190" width="400" height="60" fill={room.floor} />
      <rect y="186" width="400" height="6" fill="#2B2118" opacity="0.18" />
      <Painting x={46} y={62} w={wide ? 96 : 70} h={wide ? 70 : 92} rng={rng} />
      <Painting x={wide ? 176 : 162} y={52} w={wide ? 70 : 84} h={wide ? 100 : 106} rng={rng} />
      <Painting x={280} y={76} w={wide ? 76 : 62} h={wide ? 56 : 66} rng={rng} />
      {[94, 208, 318].map((cx) => <path key={cx} d={`M${cx - 6} 0L${cx - 46} 170H${cx + 46}L${cx + 6} 0Z`} fill={`url(#${uid}-spot)`} />)}
      <g transform="translate(236 192)">
        <rect x="-11" y="-72" width="22" height="50" rx="11" fill={room.accent} />
        <circle cx="0" cy="-86" r="12" fill="#F0C7A0" />
        <path d="M-12-88a12 12 0 0 1 24 0c-6-6-18-6-24 0z" fill="#2B2118" />
        <rect x="-9" y="-26" width="7" height="26" rx="3" fill="#2B2118" />
        <rect x="2" y="-26" width="7" height="26" rx="3" fill="#2B2118" />
      </g>
    </g>
  )
}
