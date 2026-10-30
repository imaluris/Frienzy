import type { ReactNode } from 'react'
import { Icon, type IconName } from './Icon'

// Stato vuoto: icona in un cerchio morbido, frase e (se serve) un pulsante per andare avanti.
export function EmptyState({ icon, text, children }: { icon: IconName; text: string; children?: ReactNode }) {
  return (
    <div className="empty-state">
      <span className="empty-icon"><Icon name={icon} size={32} /></span>
      <p>{text}</p>
      {children}
    </div>
  )
}
