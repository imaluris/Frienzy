import { useEffect, useState } from 'react'
import { useServices } from '../app/ServicesContext'
import type { FrienzyEvent } from '../domain/event'
import { EVENT_TYPE_EMOJI } from '../domain/eventTypes'
import { useEventPeople } from '../people/useEventPeople'
import { useExactPlace } from '../place/useExactPlace'
import { EventPeople } from './EventPeople'
import { OrganizerActions } from './OrganizerActions'
import { ParticipationActions } from './ParticipationActions'
import { decideView } from '../participation/participationView'
import { useEventParticipation } from '../participation/useEventParticipation'
import { describeCapacity, formatEventDate } from '../events/format'

// Dettaglio di un evento: la zona per tutti; l'indirizzo esatto solo a organizzatore e confermati.
export function EventDetailScreen({ eventId }: { eventId: string }) {
  const services = useServices()
  const { events } = services
  const [version, setVersion] = useState(0) // sale a ogni azione: fa ricaricare evento, persone e luogo
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
  }, [events, eventId, version])

  const people = useEventPeople(services, state.event)
  const place = useExactPlace(services, state.event?.id ?? null, version)
  const uid = services.auth.currentUid()
  const participation = useEventParticipation(services, state.event, uid, version)
  const reload = () => setVersion((v) => v + 1)

  if (state.loading) return <p className="card loading">Caricamento…</p>
  const event = state.event
  return (
    <section className="card">
      {event ? (
        <>
          <h2>{EVENT_TYPE_EMOJI[event.tipo]} {event.titolo}</h2>
          <p>{formatEventDate(event.dataOra)}</p>
          <p>Zona: {event.zonaNome}</p>
          {place && <p>Indirizzo: {place.indirizzo}</p>}
          {event.descrizione && <p>{event.descrizione}</p>}
          <p>{describeCapacity(event.maxPartecipanti)}</p>
          {event.richiedeApprovazione && <p>L'organizzatore approva le richieste.</p>}
          <EventPeople people={people} />
          {uid && participation.loaded && (
            event.organizzatoreId === uid ? (
              <OrganizerActions event={event} uid={uid} requests={participation.requests} confirmedCount={participation.confirmedCount} onChanged={reload} />
            ) : (
              <ParticipationActions view={decideView({ event, uid, mine: participation.mine, confirmedCount: participation.confirmedCount })} eventId={event.id} uid={uid} onChanged={reload} />
            )
          )}
        </>
      ) : (
        <p role="alert" className="error">Evento non trovato.</p>
      )}
    </section>
  )
}
