import { EmptyFrame, INK } from './common'

// Nessun avviso: una campanella senape con il batacchio terracotta e tre piccoli segni di quiete (zZ) accanto.
export function NoAlertsArt() {
  return (
    <EmptyFrame blob="#FBE3DC">
      <ellipse cx="80" cy="108" rx="28" ry="4" fill="#2B2118" opacity="0.12" />
      <path d="M80 28C64 28 54 40 54 56V68C54 76 48 80 44 86H116C112 80 106 76 106 68V56C106 40 96 28 80 28Z" fill="#F2B94B" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M44 86H116" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="80" cy="24" r="5" fill="#E2725B" stroke={INK} strokeWidth="3" />
      <path d="M70 92A10 10 0 0 0 90 92Z" fill="#E2725B" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M64 44Q66 38 72 36" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" opacity="0.85" />
      <path d="M118 40H128L118 52H128" fill="none" stroke="#2F5D50" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M132 26H138L132 33H138" fill="none" stroke="#2F5D50" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </EmptyFrame>
  )
}
