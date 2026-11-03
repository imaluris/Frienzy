import { Sparkle } from '../shapes'
import type { SceneProps } from './types'

const FIELDS = [
  { sky: '#9FD0E8', a: '#4F9A5E', b: '#5BAA6B' },
  { sky: '#F6C79E', a: '#4A8F63', b: '#58A070' },
  { sky: '#B7D4F0', a: '#3F8A6A', b: '#4D9B79' },
] as const

export function Sport({ rng, uid }: SceneProps) {
  const field = rng.pick(FIELDS)
  const ballX = rng.between(190, 280)
  const stripes = Array.from({ length: 6 }, (_, i) => i)
  return (
    <g>
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={field.sky} />
          <stop offset="1" stopColor="#F4F0DC" />
        </linearGradient>
        <clipPath id={`${uid}-ball`}><circle cx={ballX} cy="168" r="22" /></clipPath>
      </defs>
      <rect width="400" height="240" fill={`url(#${uid}-sky)`} />
      <path d="M0 96H400V128H0Z" fill="#2F6F9A" opacity="0.35" />
      {stripes.map((i) => <rect key={i} x={i * 70 - 10} y="96" width="34" height="32" fill="#2F6F9A" opacity="0.2" />)}
      <rect y="128" width="400" height="120" fill={field.a} />
      {stripes.map((i) => <rect key={i} x={i * 80 - 40} y="128" width="40" height="120" fill={field.b} />)}
      <path d="M0 150H400" stroke="#FFFFFF" strokeOpacity="0.85" strokeWidth="3" />
      <ellipse cx="200" cy="200" rx="84" ry="26" fill="none" stroke="#FFFFFF" strokeOpacity="0.85" strokeWidth="3" />
      <g transform="translate(60 128)" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round">
        <path d="M0 0V-44H70V0" />
        <path d="M0-44L-14-30M70-44L84-30" strokeWidth="2.5" />
        <path d="M14-44V0M28-44V0M42-44V0M56-44V0M0-22H70" strokeWidth="1.2" opacity="0.7" />
      </g>
      <ellipse cx={ballX} cy="192" rx="22" ry="6" fill="#2B2118" opacity="0.25" />
      <circle cx={ballX} cy="168" r="22" fill="#FFFFFF" stroke="#2B2118" strokeWidth="2.5" />
      <g clipPath={`url(#${uid}-ball)`} fill="#2B2118">
        <path d={`M${ballX} 158l9 7-3 11h-12l-3-11z`} />
        <path d={`M${ballX - 22} 160l8 2-1 7zM${ballX + 22} 160l-8 2 1 7zM${ballX - 9} 190l-4-8 9 1zM${ballX + 9} 190l4-8-9 1z`} />
      </g>
      <Sparkle x={ballX + 44} y={140} size={8} fill="#FFFFFF" />
      <Sparkle x={ballX - 48} y={152} size={6} fill="#FFFFFF" />
    </g>
  )
}
