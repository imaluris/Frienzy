import { useEffect, useState } from 'react'
import { useServices } from '../app/ServicesContext'
import type { FrienzyEvent } from '../domain/event'
import { EVENT_TYPE_EMOJI } from '../domain/eventTypes'
import { useEventPeople } from '../people/useEventPeople'
import { EventPeople } from './EventPeople'
import { describeCapacity, formatEventDate } from '../events/format'

// Dettaglio di un evento: solo dati pubblici (la zona, mai l'indirizzo esatto).
export function EventDetailScreen({ eventId, onBack }: { eventId: string; onBack: () => void }) {
  const services = useServices()
  const { events } = services
  const [state, setState] = useState<{ loading: boolean; event: FrienzyEvent | null }>({ loading: true, event: null })

  useEffect(() => {
    let active = true
    events
      .getById(eventId)
      .then((event) => active && setState({ loading: false, event }))
      .catch(() => active && setState({ loading: false, event: null }))
    return () => {
      active = false
    }
  }, [events, eventId])

  const people = useEventPeople(services, state.event)

  if (state.loading) return <p className="card">Caricamento…</p>
  const event = state.event
  return (
    <section className="card">
      {event ? (
        <>
          <h2>{EVENT_TYPE_EMOJI[event.tipo]} {event.titolo}</h2>
          <p>{formatEventDate(event.dataOra)}</p>
          <p>Zona: {event.zonaNome}</p>
          {event.descrizione && <p>{event.descrizione}</p>}
          <p>{describeCapacity(event.maxPartecipanti)}</p>
          {event.richiedeApprovazione && <p>L'organizzatore approva le richieste.</p>}
          <EventPeople people={people} />
        </>
      ) : (
        <p role="alert" className="error">Evento non trovato.</p>
      )}
      <button type="button" className="link" onClick={onBack}>Torna all'elenco</button>
    </section>
  )
}
