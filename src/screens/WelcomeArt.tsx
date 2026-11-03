import { Sparkle } from '../art/shapes'
import { WelcomeFriend } from './WelcomeFriend'

// Illustrazione di benvenuto (SVG originale): tre amici brindano a un tavolo all'aperto, al tramonto,
// sotto una fila di lucine, con colline e una casetta sullo sfondo. Solo i colori del progetto.
const LIGHTS = [28, 72, 118, 166, 214, 260, 300]

export function WelcomeArt() {
  return (
    <svg className="welcome-art" viewBox="0 0 320 260" role="img" aria-label="Tre amici che brindano a un tavolo all'aperto, al tramonto">
      <defs>
        <linearGradient id="wa-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F7B7A3" />
          <stop offset="0.6" stopColor="#FFD9A0" />
          <stop offset="1" stopColor="#FFF0CF" />
        </linearGradient>
      </defs>
      <rect width="320" height="260" rx="28" fill="url(#wa-sky)" />
      <circle cx="250" cy="96" r="56" fill="#FFF3C4" opacity="0.4" />
      <circle cx="250" cy="96" r="38" fill="#FFF3C4" opacity="0.7" />
      <circle cx="250" cy="96" r="26" fill="#FFFBE6" />
      <path d="M-10 150C50 110 110 130 170 120S280 100 330 130V270H-10Z" fill="#7FAE8F" opacity="0.7" />
      <path d="M-10 176C60 146 120 170 190 158S290 150 330 168V270H-10Z" fill="#2F5D50" opacity="0.85" />
      <g transform="translate(34 138)">
        <rect width="46" height="34" rx="4" fill="#FFF8F0" />
        <path d="M-5 2L23-18L51 2Z" fill="#E2725B" />
        <rect x="9" y="12" width="9" height="9" rx="2" fill="#F2B94B" />
        <rect x="28" y="14" width="9" height="20" rx="2" fill="#5A3A22" />
      </g>
      <path d="M12 26Q160 74 308 24" fill="none" stroke="#2B2118" strokeWidth="1.8" opacity="0.5" />
      {LIGHTS.map((cx, i) => {
        const cy = 26 + 48 * (cx / 320) * (1 - cx / 320) * 1.9 + 4
        const c = ['#FFF3C4', '#F2B94B', '#FFFFFF'][i % 3]
        return (
          <g key={cx}>
            <circle cx={cx} cy={cy + 4} r="11" fill={c} opacity="0.3" />
            <circle cx={cx} cy={cy + 4} r="5" fill={c} />
          </g>
        )
      })}
      <WelcomeFriend x={92} body="#2F5D50" skin="#F0C7A0" hair="#2B2118" lean={-4} />
      <WelcomeFriend x={160} body="#E2725B" skin="#C98D63" hair="#5A3A22" lean={0} />
      <WelcomeFriend x={228} body="#F2B94B" skin="#8A5A3C" hair="#2B2118" lean={4} />
      <rect x="52" y="196" width="216" height="14" rx="7" fill="#5A3A22" />
      <rect x="150" y="208" width="20" height="40" rx="5" fill="#5A3A22" />
      <ellipse cx="160" cy="250" rx="60" ry="6" fill="#2B2118" opacity="0.18" />
      <g stroke="#2B2118" strokeWidth="2">
        <ellipse cx="116" cy="193" rx="20" ry="5" fill="#FFFFFF" />
        <ellipse cx="204" cy="193" rx="20" ry="5" fill="#FFFFFF" />
      </g>
      <ellipse cx="116" cy="191" rx="12" ry="3" fill="#E2725B" />
      <ellipse cx="204" cy="191" rx="12" ry="3" fill="#F2B94B" />
      <Sparkle x={288} y={176} size={9} fill="#FFFFFF" />
      <Sparkle x={30} y={104} size={7} fill="#FFFFFF" />
      <Sparkle x={196} y={68} size={6} fill="#FFFFFF" />
    </svg>
  )
}
