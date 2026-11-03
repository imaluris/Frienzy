import type { ReactNode } from 'react'
import { EmptyArt, type EmptyArtKind } from '../art/EmptyArt'

// Stato vuoto: illustrazione originale, frase e (se serve) un pulsante per andare avanti.
export function EmptyState({ art, text, children }: { art: EmptyArtKind; text: string; children?: ReactNode }) {
  return (
    <div className="empty-state">
      <EmptyArt kind={art} label="" />
      <p>{text}</p>
      {children}
    </div>
  )
}
