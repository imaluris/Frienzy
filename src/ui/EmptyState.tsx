import type { ReactNode } from 'react'

// Stato vuoto: emoji grande, frase e (se serve) un pulsante per andare avanti.
export function EmptyState({ emoji, text, children }: { emoji: string; text: string; children?: ReactNode }) {
  return (
    <div className="empty-state">
      <span className="empty-emoji" aria-hidden="true">{emoji}</span>
      <p>{text}</p>
      {children}
    </div>
  )
}
