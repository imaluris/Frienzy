import { Hill, Sparkle, StringLights, Sun } from '../shapes'
import type { SceneProps } from './types'

// Tre tramonti diversi: si sceglie con l'id dell'evento.
const SKIES = [
  { top: '#F4A27C', bottom: '#FFD98A', sun: '#FFF1C9', drink: '#F2662F' },
  { top: '#D9688C', bottom: '#F7B27A', sun: '#FFE7B8', drink: '#E2402F' },
  { top: '#8E6FB8', bottom: '#F29A8B', sun: '#FFE9C7', drink: '#F28A2E' },
] as const

function Glass({ x, drink }: { x: number; drink: string }) {
  return (
    <g transform={`translate(${x} 124)`}>
      <path d="M-22 0H22L2 24V50H-2V24Z" fill="#FFFFFF" fillOpacity="0.55" stroke="#2B2118" strokeWidth="2" strokeLinejoin="round" />
      <path d="M-16 4H16L2 22H-2Z" fill={drink} />
      <path d="M-14 56H14" stroke="#2B2118" strokeWidth="3" strokeLinecap="round" />
      <circle cx="15" cy="2" r="9" fill="#F2B94B" stroke="#2B2118" strokeWidth="1.6" />
      <path d="M15 -5V9M8 2H22" stroke="#FFF8F0" strokeWidth="1.2" />
    </g>
  )
}

export function Aperitivo({ rng, uid }: SceneProps) {
  const sky = rng.pick(SKIES)
  const glasses = rng.int(2) + 2
  const bubbles = Array.from({ length: 7 }, () => ({ x: rng.between(40, 360), y: rng.between(70, 130), r: rng.between(2, 5) }))
  return (
    <g>
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky.top} />
          <stop offset="1" stopColor={sky.bottom} />
        </linearGradient>
      </defs>
      <rect width="400" height="240" fill={`url(#${uid}-sky)`} />
      <Sun x={rng.between(250, 320)} y={rng.between(110, 135)} r={34} fill={sky.sun} />
      <Hill y={140} amp={14} fill="#2F5D50" phase={0.3} />
      <Hill y={160} amp={10} fill="#244A40" phase={-0.2} />
      <StringLights y={34} count={9} colors={['#FFF1C9', '#F2B94B', '#FFD0C2']} />
      {bubbles.map((b) => <circle key={b.x} cx={b.x} cy={b.y} r={b.r} fill="#FFFFFF" opacity="0.4" />)}
      <rect x="0" y="180" width="400" height="70" fill="#5A3A22" />
      <rect x="0" y="180" width="400" height="6" fill="#7A4E2D" />
      {glasses === 3 && <Glass x={118} drink={sky.drink} />}
      <Glass x={glasses === 3 ? 200 : 165} drink={sky.drink} />
      <Glass x={glasses === 3 ? 282 : 235} drink={sky.drink} />
      <Sparkle x={72} y={96} size={9} fill="#FFFFFF" />
      <Sparkle x={344} y={78} size={7} fill="#FFFFFF" />
    </g>
  )
}
