import type { FrienzyEvent } from '../domain/event'

export interface EventBadge {
  label: string
  tone: 'neutral' | 'accent' | 'warn'
}

/** Etichette di una scheda evento: annullato, oppure libero / su approvazione. */
export function eventBadges(event: FrienzyEvent): EventBadge[] {
  if (event.stato === 'annullato') return [{ label: 'Annullato', tone: 'warn' }]
  return event.richiedeApprovazione
    ? [{ label: 'Su approvazione', tone: 'accent' }]
    : [{ label: 'Accesso libero', tone: 'neutral' }]
}
