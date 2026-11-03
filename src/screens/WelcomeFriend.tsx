// Un amico seduto al tavolo: busto, testa con capelli e guance, braccio alzato con il bicchiere.
export function WelcomeFriend({ x, body, skin, hair, lean }: { x: number; body: string; skin: string; hair: string; lean: number }) {
  return (
    <g transform={`translate(${x} 0) rotate(${lean} 0 196)`}>
      <rect x="-28" y="138" width="56" height="64" rx="28" fill={body} />
      <path d="M22 156q22-6 24-34" fill="none" stroke={body} strokeWidth="13" strokeLinecap="round" />
      <circle cx="46" cy="118" r="7" fill={skin} />
      <circle cx="0" cy="116" r="22" fill={skin} />
      <path d="M-23 112a23 23 0 0 1 46 0c-4-9-12-13-23-13s-19 4-23 13z" fill={hair} />
      <circle cx="-8" cy="118" r="2.4" fill="#2B2118" />
      <circle cx="8" cy="118" r="2.4" fill="#2B2118" />
      <circle cx="-14" cy="126" r="4" fill="#E2725B" opacity="0.35" />
      <circle cx="14" cy="126" r="4" fill="#E2725B" opacity="0.35" />
      <path d="M-6 127q6 6 12 0" fill="none" stroke="#2B2118" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M40 108h12l-2 14H42z" fill="#FFFFFF" stroke="#2B2118" strokeWidth="2" strokeLinejoin="round" />
    </g>
  )
}
