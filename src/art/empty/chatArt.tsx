import { EmptyFrame, INK } from './common'

// Nessun messaggio: due fumetti sovrapposti, uno senape e uno terracotta, con i puntini di chi sta per scrivere.
export function NoMessagesArt() {
  return (
    <EmptyFrame blob="#DCEBE3">
      <ellipse cx="80" cy="108" rx="30" ry="4" fill="#2B2118" opacity="0.12" />
      <path d="M44 34H100A12 12 0 0 1 112 46V66A12 12 0 0 1 100 78H68L52 92V78H44A12 12 0 0 1 32 66V46A12 12 0 0 1 44 34Z" fill="#F2B94B" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M72 52H118A12 12 0 0 1 130 64V82A12 12 0 0 1 118 94H112V104L98 94H72A12 12 0 0 1 60 82V64A12 12 0 0 1 72 52Z" fill="#E2725B" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      <circle cx="78" cy="73" r="4" fill="#FFFFFF" />
      <circle cx="95" cy="73" r="4" fill="#FFFFFF" />
      <circle cx="112" cy="73" r="4" fill="#FFFFFF" />
      <path d="M44 52Q48 46 56 46" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
    </EmptyFrame>
  )
}
