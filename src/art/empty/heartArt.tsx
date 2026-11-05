import { EmptyFrame, INK } from './common'

// Nessun evento salvato: un cuore grande con una piccola etichetta a segnalibro.
export function NoSavedArt() {
  return (
    <EmptyFrame blob="#FBE3DC">
      <ellipse cx="80" cy="106" rx="26" ry="4" fill="#2B2118" opacity="0.12" />
      <path d="M80 100C48 78 40 60 46 46C52 32 70 32 80 46C90 32 108 32 114 46C120 60 112 78 80 100Z" fill="#E2725B" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M58 48Q62 42 70 42" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
      <path d="M34 86C34 80 42 80 42 86C42 91 38 93 38 95C38 93 34 91 34 86Z" fill="#F2B94B" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <circle cx="124" cy="34" r="4" fill="#2F5D50" />
      <circle cx="50" cy="26" r="3" fill="#FFFFFF" />
      <g transform="translate(112 62) rotate(14)">
        <path d="M-12 -18H12V18L0 9L-12 18Z" fill="#F2B94B" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      </g>
    </EmptyFrame>
  )
}
