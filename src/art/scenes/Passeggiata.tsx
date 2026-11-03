import { RoundTree, Sparkle, Sun } from '../shapes'
import type { SceneProps } from './types'

const DAYS = [
  { top: '#CDEBD3', bottom: '#F5F2D2', grass: '#7FBF8E', dark: '#4F8A73', leaf: '#3F7F5F' },
  { top: '#FBE0C3', bottom: '#FFF4D6', grass: '#9BCB8A', dark: '#5E9570', leaf: '#4C8A5A' },
  { top: '#CFE3F0', bottom: '#EEF6E0', grass: '#86C49B', dark: '#4F8A73', leaf: '#397A5A' },
] as const

function Bird({ x, y }: { x: number; y: number }) {
  return <path d={`M${x} ${y}q8-9 16 0q8-9 16 0`} fill="none" stroke="#2B2118" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
}

export function Passeggiata({ rng, uid }: SceneProps) {
  const day = rng.pick(DAYS)
  const trees = [
    { x: rng.between(40, 80), y: 170, s: rng.between(1.1, 1.4) },
    { x: rng.between(310, 360), y: 166, s: rng.between(1, 1.3) },
    { x: rng.between(160, 230), y: 152, s: rng.between(0.6, 0.8) },
  ]
  return (
    <g>
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={day.top} />
          <stop offset="1" stopColor={day.bottom} />
        </linearGradient>
      </defs>
      <rect width="400" height="240" fill={`url(#${uid}-sky)`} />
      <Sun x={rng.between(280, 330)} y={58} r={22} fill="#FFF0B0" />
      <ellipse cx="110" cy="60" rx="44" ry="13" fill="#FFFFFF" opacity="0.8" />
      <ellipse cx="136" cy="52" rx="30" ry="12" fill="#FFFFFF" opacity="0.8" />
      <Bird x={rng.between(200, 240)} y={rng.between(44, 72)} />
      <Bird x={rng.between(250, 280)} y={rng.between(80, 96)} />
      <path d="M-10 150C80 128 300 128 410 150V240H-10Z" fill={day.grass} />
      <RoundTree x={trees[2].x} y={trees[2].y} s={trees[2].s} fill={day.dark} trunk="#5A3A22" />
      <path d="M170 240C190 200 150 176 214 152C246 140 262 148 290 138" fill="none" stroke="#F4E6C8" strokeWidth="30" strokeLinecap="round" />
      <path d="M-10 196C80 182 150 214 200 240V252H-10Z" fill={day.dark} opacity="0.35" />
      <RoundTree x={trees[0].x} y={trees[0].y} s={trees[0].s} fill={day.leaf} trunk="#5A3A22" />
      <RoundTree x={trees[1].x} y={trees[1].y} s={trees[1].s} fill={day.leaf} trunk="#5A3A22" />
      <g transform="translate(246 160)">
        <rect x="-26" y="-18" width="52" height="8" rx="3" fill="#5A3A22" />
        <rect x="-26" y="-34" width="52" height="8" rx="3" fill="#7A4E2D" />
        <path d="M-20-10V4M20-10V4" stroke="#2B2118" strokeWidth="3" strokeLinecap="round" />
      </g>
      <g transform="translate(328 128)">
        <path d="M0 0V50" stroke="#2B2118" strokeWidth="2" />
        <ellipse cx="0" cy="-12" rx="14" ry="17" fill="#E2725B" />
        <path d="M0 5L-3 10H3Z" fill="#E2725B" />
      </g>
      <Sparkle x={68} y={104} size={7} fill="#FFFFFF" />
    </g>
  )
}
