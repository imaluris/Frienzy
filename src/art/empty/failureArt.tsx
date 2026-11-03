import { EmptyFrame, INK } from './common'

// Qualcosa è andato storto: una nuvola con un punto esclamativo.
export function FailureArt() {
  return (
    <EmptyFrame blob="#FBD9D2">
      <path d="M52 92a20 20 0 0 1 2-40a28 28 0 0 1 52-6a24 24 0 0 1 4 46Z" fill="#FFFFFF" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M80 54V74" stroke="#C04A33" strokeWidth="7" strokeLinecap="round" />
      <circle cx="80" cy="85" r="4.5" fill="#C04A33" />
      <path d="M40 104Q60 112 80 104T120 104" fill="none" stroke="#2F5D50" strokeWidth="3.5" strokeLinecap="round" opacity="0.45" />
    </EmptyFrame>
  )
}

// Niente connessione: una nuvola con il segnale barrato.
export function OfflineArt() {
  return (
    <EmptyFrame blob="#D6E6F2">
      <path d="M52 94a20 20 0 0 1 2-40a28 28 0 0 1 52-6a24 24 0 0 1 4 46Z" fill="#FFFFFF" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M62 66a26 26 0 0 1 36 0M69 74a16 16 0 0 1 22 0" fill="none" stroke="#2F6F9A" strokeWidth="5" strokeLinecap="round" />
      <circle cx="80" cy="83" r="4" fill="#2F6F9A" />
      <path d="M58 40L104 98" stroke="#FFFFFF" strokeWidth="11" strokeLinecap="round" />
      <path d="M58 40L104 98" stroke="#E2725B" strokeWidth="5" strokeLinecap="round" />
    </EmptyFrame>
  )
}
