import type { ReactNode } from 'react'
import type { ExactPlace, FrienzyEvent } from '../domain/event'
import { EVENT_TYPE_EMOJI } from '../domain/eventTypes'
import { eventBadges } from '../events/badges'
import { Icon, type IconName } from '../ui/Icon'
import { describeCapacity, formatEventDate } from '../events/format'

function Row({ icon, label, children }: { icon: IconName; label: string; children: ReactNode }) {
  return (
    <li className="info-row">
      <span className="info-icon"><Icon name={icon} size={20} /></span>
      <span className="info-text"><small>{label}</small>{children}</span>
    </li>
  )
}

// Parte alta del dettaglio: emoji grande, titolo, badge e righe con quando / dove / posti.
export function EventInfo({ event, place }: { event: FrienzyEvent; place: ExactPlace | null }) {
  return (
    <>
      <header className="event-hero">
        <span className={`event-emoji event-emoji-lg type-${event.tipo}`} aria-hidden="true">{EVENT_TYPE_EMOJI[event.tipo]}</span>
        <h2>{event.titolo}</h2>
        <span className="event-card-badges">
          {eventBadges(event).map((b) => <span key={b.label} className={`badge badge-${b.tone}`}>{b.label}</span>)}
        </span>
      </header>
      <ul className="info-rows">
        <Row icon="calendar" label="Quando">{formatEventDate(event.dataOra)}</Row>
        <Row icon="pin" label="Zona">{event.zonaNome}</Row>
        {place && <Row icon="home" label="Indirizzo">{place.indirizzo}</Row>}
        <Row icon="users" label="Posti">{describeCapacity(event.maxPartecipanti)}</Row>
      </ul>
      {event.descrizione && <p className="event-description">{event.descrizione}</p>}
      {event.richiedeApprovazione && <p className="muted">L'organizzatore approva le richieste.</p>}
    </>
  )
}
