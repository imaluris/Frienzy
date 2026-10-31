import type { ReactNode } from 'react'
import type { ExactPlace, FrienzyEvent } from '../domain/event'
import { describeCapacity, formatEventDate } from '../events/format'
import { Icon, type IconName } from '../ui/Icon'

function Row({ icon, label, children }: { icon: IconName; label: string; children: ReactNode }) {
  return (
    <li className="info-row">
      <span className="info-icon"><Icon name={icon} size={20} /></span>
      <span className="info-text"><small>{label}</small>{children}</span>
    </li>
  )
}

// Blocco informazioni: quando, zona, indirizzo (solo se permesso), posti, e la descrizione.
export function EventInfo({ event, place }: { event: FrienzyEvent; place: ExactPlace | null }) {
  return (
    <>
      <ul className="info-rows">
        <Row icon="calendar" label="Quando">{formatEventDate(event.dataOra)}</Row>
        <Row icon="pin" label="Zona">{event.zonaNome}</Row>
        {place && <Row icon="home" label="Indirizzo">{place.indirizzo}</Row>}
        <Row icon="users" label="Posti">{describeCapacity(event.maxPartecipanti)}</Row>
        {event.richiedeApprovazione && <Row icon="shield" label="Come si entra">L'organizzatore approva le richieste.</Row>}
      </ul>
      {event.descrizione && (
        <section className="detail-section" aria-label="Descrizione">
          <h3>Di cosa si tratta</h3>
          <p className="event-description">{event.descrizione}</p>
        </section>
      )}
    </>
  )
}
