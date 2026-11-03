import { Sparkle } from '../shapes'
import type { SceneProps } from './types'

const PARTY = ['#E2725B', '#2F5D50', '#6F5AA8', '#2F6F9A', '#FFF8F0', '#E2725B'] as const
const BGS = [
  { a: '#F6C555', b: '#F2A93B' },
  { a: '#F2B94B', b: '#E2725B' },
  { a: '#F8D77A', b: '#EBA64B' },
] as const

function Balloon({ x, y, fill, tilt }: { x: number; y: number; fill: string; tilt: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt})`}>
      <path d="M0 22Q-6 70 6 110" fill="none" stroke="#2B2118" strokeWidth="1.8" opacity="0.6" />
      <ellipse cx="0" cy="0" rx="24" ry="29" fill={fill} />
      <ellipse cx="-8" cy="-10" rx="5" ry="9" fill="#FFFFFF" opacity="0.35" />
      <path d="M0 28L-5 36H5Z" fill={fill} />
    </g>
  )
}

export function Altro({ rng, uid }: SceneProps) {
  const bg = rng.pick(BGS)
  const [balloonA, balloonB] = [rng.pick(PARTY.slice(0, 4)), rng.pick(PARTY.slice(1, 5))]
  const confetti = Array.from({ length: 22 }, () => ({ x: rng.between(10, 390), y: rng.between(10, 230), r: rng.between(0, 180), c: rng.pick(PARTY), w: rng.between(7, 13) }))
  return (
    <g>
      <defs>
        <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={bg.a} />
          <stop offset="1" stopColor={bg.b} />
        </linearGradient>
      </defs>
      <rect width="400" height="240" fill={`url(#${uid}-bg)`} />
      <circle cx="200" cy="130" r="92" fill="#FFFFFF" opacity="0.2" />
      <circle cx="200" cy="130" r="62" fill="#FFFFFF" opacity="0.22" />
      {confetti.map((p, i) => <rect key={i} x={p.x} y={p.y} width={p.w} height={p.w * 0.45} rx="2" fill={p.c} transform={`rotate(${p.r} ${p.x} ${p.y})`} />)}
      <path d="M0 22Q100 62 200 28T400 24" fill="none" stroke="#2B2118" strokeWidth="1.8" opacity="0.5" />
      {[40, 100, 160, 220, 280, 340].map((x, i) => (
        <path key={x} d={`M${x} ${28 + (i % 2) * 8}l22 4l-8 26z`} fill={PARTY[i]} />
      ))}
      <Balloon x={rng.between(60, 110)} y={rng.between(100, 128)} fill={balloonA} tilt={-8} />
      <Balloon x={rng.between(290, 340)} y={rng.between(104, 132)} fill={balloonB} tilt={9} />
      <Sparkle x={200} y={128} size={48} fill="#FFFFFF" />
      <Sparkle x={200} y={128} size={30} fill="#E2725B" />
      <Sparkle x={140} y={190} size={10} fill="#FFFFFF" />
      <Sparkle x={262} y={86} size={12} fill="#FFFFFF" />
    </g>
  )
}
