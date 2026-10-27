import type { ReactNode } from 'react'
import type { FrienzyEvent } from '../domain/event'
import { EVENT_TYPE_EMOJI } from '../domain/eventTypes'
import { eventBadges } from '../events/badges'
import { describePlacesShort, formatShortDate } from '../events/format'

interface Props {
  event: FrienzyEvent
  onOpen: () => void
  /** Riga in più sotto la scheda, es. lo stato della mia iscrizione. */
  note?: string
  footer?: ReactNode
}

// Scheda di un evento: emoji grande, titolo, quando, dove, posti e badge. Tutta la scheda è un pulsante.
export function EventCard({ event, onOpen, note, footer }: Props) {
  return (
    <article className={`event-card${event.stato === 'annullato' ? ' is-cancelled' : ''}`}>
      <button type="button" className="event-card-main" onClick={onOpen}>
        <span className={`event-emoji type-${event.tipo}`} aria-hidden="true">{EVENT_TYPE_EMOJI[event.tipo]}</span>
        <span className="event-card-body">
          <span className="event-card-title">{event.titolo}</span>
          <span className="event-card-meta">{formatShortDate(event.dataOra)}</span>
          <span className="event-card-meta">{event.zonaNome} · {describePlacesShort(event.maxPartecipanti)}</span>
          <span className="event-card-badges">
            {eventBadges(event).map((b) => <span key={b.label} className={`badge badge-${b.tone}`}>{b.label}</span>)}
            {note && <span className="badge badge-neutral">{note}</span>}
          </span>
        </span>
      </button>
      {footer}
    </article>
  )
}
