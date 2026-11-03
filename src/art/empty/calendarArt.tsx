import { EmptyFrame, INK } from './common'

// Nessun evento in programma: un calendario con pagine bianche e una matita.
export function NoEventsArt() {
  return (
    <EmptyFrame blob="#FBE3DC">
      <rect x="44" y="34" width="72" height="68" rx="12" fill="#FFFFFF" stroke={INK} strokeWidth="3" />
      <path d="M44 56H116V46a12 12 0 0 0-12-12H56a12 12 0 0 0-12 12Z" fill="#E2725B" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M62 26V40M98 26V40" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      {[0, 1, 2].map((r) => [0, 1, 2].map((c) => (
        <rect key={`${r}${c}`} x={55 + c * 20} y={64 + r * 11} width="12" height="7" rx="3" fill={r === 1 && c === 1 ? '#F2B94B' : '#F1E3D3'} />
      )))}
      <g transform="translate(120 98) rotate(35)">
        <rect x="-5" y="-28" width="10" height="34" rx="3" fill="#F2B94B" stroke={INK} strokeWidth="2.5" />
        <path d="M-5 6H5L0 16Z" fill="#F0C7A0" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      </g>
    </EmptyFrame>
  )
}

// Nessun risultato: una lente d'ingrandimento che non trova nulla.
export function NoResultsArt() {
  return (
    <EmptyFrame blob="#FFE9B8">
      <circle cx="74" cy="62" r="30" fill="#FFFFFF" stroke={INK} strokeWidth="4" />
      <circle cx="74" cy="62" r="22" fill="#CFE5DB" opacity="0.6" />
      <path d="M96 84L120 108" stroke={INK} strokeWidth="9" strokeLinecap="round" />
      <path d="M96 84L120 108" stroke="#E2725B" strokeWidth="4" strokeLinecap="round" />
      <path d="M64 56L84 76M84 56L64 76" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      <path d="M58 40Q66 34 76 34" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
    </EmptyFrame>
  )
}
