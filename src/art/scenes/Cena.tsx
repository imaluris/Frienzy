import { Sparkle } from '../shapes'
import type { SceneProps } from './types'

const ROOMS = [
  { wall: '#7A2E22', glow: '#FFD08A', cloth: '#F7E6D0' },
  { wall: '#5E2B3A', glow: '#FFC48A', cloth: '#F3DDD2' },
  { wall: '#3F4A3A', glow: '#FFDFA0', cloth: '#F4EAD2' },
] as const

function Plate({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <ellipse cx={x} cy={y} rx="44" ry="13" fill="#FFFFFF" />
      <ellipse cx={x} cy={y} rx="30" ry="8" fill="#F1E3D3" />
      <ellipse cx={x} cy={y - 1} rx="14" ry="4" fill="#E2725B" />
      <path d={`M${x - 58} ${y - 6}v14M${x + 58} ${y - 6}v14`} stroke="#B9B2A8" strokeWidth="3" strokeLinecap="round" />
    </g>
  )
}

export function Cena({ rng, uid }: SceneProps) {
  const room = rng.pick(ROOMS)
  const lampX = rng.between(170, 230)
  const bottle = rng.int(2) === 0
  return (
    <g>
      <defs>
        <radialGradient id={`${uid}-glow`} cx="0.5" cy="0.1" r="0.8">
          <stop offset="0" stopColor={room.glow} stopOpacity="0.85" />
          <stop offset="1" stopColor={room.glow} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="240" fill={room.wall} />
      <path d={`M${lampX - 24} 52L${lampX - 150} 240H${lampX + 150}L${lampX + 24} 52Z`} fill={`url(#${uid}-glow)`} />
      <path d={`M${lampX} 0V44`} stroke="#2B2118" strokeWidth="2.5" />
      <path d={`M${lampX - 26} 58A26 20 0 0 1 ${lampX + 26} 58Z`} fill="#2B2118" />
      <ellipse cx={lampX} cy="58" rx="26" ry="5" fill={room.glow} />
      <rect x="0" y="156" width="400" height="90" fill={room.cloth} />
      <path d="M0 156H400" stroke="#2B2118" strokeOpacity="0.15" strokeWidth="3" />
      <Plate x={lampX - 80} y={184} />
      <Plate x={lampX + 80} y={184} />
      <g transform={`translate(${lampX} 156)`}>
        <rect x="-5" y="-30" width="10" height="30" rx="3" fill="#FFF8F0" />
        <path d="M0-52Q-8-40 0-34Q8-40 0-52Z" fill="#F2B94B" />
        <circle cx="0" cy="-42" r="14" fill={room.glow} opacity="0.35" />
      </g>
      {bottle && (
        <g transform={`translate(${lampX + 140} 156)`}>
          <rect x="-9" y="-56" width="18" height="56" rx="7" fill="#2F5D50" />
          <rect x="-3.5" y="-72" width="7" height="20" rx="3" fill="#2F5D50" />
          <rect x="-9" y="-30" width="18" height="16" fill="#FFF8F0" opacity="0.85" />
        </g>
      )}
      <Sparkle x={lampX - 120} y={96} size={7} fill={room.glow} />
      <Sparkle x={lampX + 108} y={80} size={9} fill={room.glow} />
    </g>
  )
}
