import { Hill, Pine, Sun } from '../shapes'
import type { SceneProps } from './types'

const SKIES = [
  { top: '#BFE0E8', bottom: '#F4F0D6', far: '#8FB6A8', mid: '#4F8A73', near: '#2F5D50' },
  { top: '#F6C79E', bottom: '#FDEBC4', far: '#A3B5A0', mid: '#5E8F6F', near: '#2F5D50' },
  { top: '#9EC4DE', bottom: '#E4EFE2', far: '#7FA39A', mid: '#3F7A64', near: '#25483E' },
] as const

export function Trekking({ rng, uid }: SceneProps) {
  const sky = rng.pick(SKIES)
  const peak = rng.between(150, 250)
  const trees = Array.from({ length: 6 }, (_, i) => ({ x: 30 + i * 62 + rng.between(-14, 14), y: rng.between(196, 214), s: rng.between(0.8, 1.2) }))
  return (
    <g>
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky.top} />
          <stop offset="1" stopColor={sky.bottom} />
        </linearGradient>
      </defs>
      <rect width="400" height="240" fill={`url(#${uid}-sky)`} />
      <Sun x={rng.between(60, 110)} y={64} r={24} fill="#FFF3C4" />
      <path d={`M-20 170L90 90L150 140L${peak} 56L${peak + 78} 130L300 96L430 170Z`} fill={sky.far} />
      <path d={`M${peak - 22} 78L${peak} 56L${peak + 22} 80L${peak + 8} 72L${peak} 86L${peak - 10} 72Z`} fill="#FFFFFF" opacity="0.9" />
      <Hill y={160} amp={16} fill={sky.mid} phase={0.2} />
      <path d="M150 240C170 214 230 206 215 188C204 176 250 170 258 160" fill="none" stroke="#F2E4C6" strokeWidth="9" strokeLinecap="round" />
      <Hill y={200} amp={10} fill={sky.near} phase={-0.3} />
      {trees.map((t) => <Pine key={t.x} x={t.x} y={t.y} s={t.s} fill="#1F4A3D" trunk="#5A3A22" />)}
      <g transform="translate(258 160)">
        <path d="M0 0V-26" stroke="#2B2118" strokeWidth="2.5" />
        <path d="M0-26H18L10-20L18-14H0Z" fill="#E2725B" />
      </g>
    </g>
  )
}
