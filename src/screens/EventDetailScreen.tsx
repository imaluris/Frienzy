import { useEffect, useState } from 'react'
import { useServices } from '../app/ServicesContext'
import type { FrienzyEvent } from '../domain/event'
import { headerProgress } from '../events/detailScroll'
import { shareEvent } from '../events/share'
import { useEventPeople } from '../people/useEventPeople'
import { useExactPlace } from '../place/useExactPlace'
import { effectiveView } from '../participation/actionBar'
import { decideView } from '../participation/participationView'
import { useEventParticipation } from '../participation/useEventParticipation'
import { EmptyState } from '../ui/EmptyState'
import { useScrollY } from '../ui/useScrollY'
import { ActionBar } from './ActionBar'
import { DetailTopBar } from './DetailTopBar'
import { EventAreaMap } from './EventAreaMap'
import { EventHero } from './EventHero'
import { EventInfo } from './EventInfo'
import { EventPeople } from './EventPeople'
import { OrganizerSheet } from './OrganizerSheet'
import { StatusNote } from './StatusNote'

const COVER_HEIGHT = 296
const TOAST_MS = 2600

// Dettaglio di un evento: la zona per tutti; l'indirizzo esatto solo a organizzatore e confermati.
export function EventDetailScreen({ eventId, onBack }: { eventId: string; onBack: () => void }) {
  const services = useServices()
  const { events } = services
  const [version, setVersion] = useState(0) // sale a ogni azione: fa ricaricare evento, persone e luogo
  const [state, setState] = useState<{ loading: boolean; event: FrienzyEvent | null }>({ loading: true, event: null })
  const [managing, setManaging] = useState(false)
  const [toast, setToast] = useState('')
  const scrollY = useScrollY()

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

  useEffect(() => {
    window.scrollTo(0, 0) // si arriva dalla lista già scorsa: il dettaglio parte sempre dalla copertina
  }, [eventId])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(''), TOAST_MS)
    return () => clearTimeout(timer)
  }, [toast])

  const people = useEventPeople(services, state.event)
  const place = useExactPlace(services, state.event?.id ?? null, version)
  const uid = services.auth.currentUid()
  const participation = useEventParticipation(services, state.event, uid, version)
  const reload = () => setVersion((v) => v + 1)
  const event = state.event

  async function share() {
    if (!event) return
    const result = await shareEvent(event)
    if (result === 'copied') setToast('Testo copiato: incollalo dove vuoi')
    if (result === 'unavailable') setToast('Condivisione non disponibile su questo dispositivo')
  }

  const view = event && uid ? effectiveView(event.stato, decideView({ event, uid, mine: participation.mine, confirmedCount: participation.confirmedCount })) : null
  return (
    <div className="detail-page">
      <DetailTopBar title={event?.titolo ?? ''} progress={event ? headerProgress(scrollY, COVER_HEIGHT) : 1} onBack={onBack} onShare={event ? share : null} />
      {state.loading && <p className="loading detail-loading">Caricamento…</p>}
      {!state.loading && !event && (
        <div className="detail-missing">
          <EmptyState icon="calendar-empty" text="Evento non trovato."><p role="alert" className="error">Questo evento non esiste più.</p></EmptyState>
        </div>
      )}
      {event && (
        <>
          <EventHero event={event} scrollY={scrollY} />
          <div className="detail-body">
            {view && <StatusNote view={view} />}
            <EventInfo event={event} place={place} />
            <EventPeople people={people} />
            <EventAreaMap lat={event.latApprossimata} lng={event.lngApprossimata} />
          </div>
          {uid && view && participation.loaded && (
            <ActionBar view={view} event={event} uid={uid} confirmedCount={participation.confirmedCount} pendingCount={participation.requests.length} onManage={() => setManaging(true)} onChanged={reload} />
          )}
          {managing && uid && (
            <OrganizerSheet event={event} uid={uid} requests={participation.requests} confirmedCount={participation.confirmedCount} onChanged={reload} onClose={() => setManaging(false)} />
          )}
        </>
      )}
      {toast && <p className="toast" role="status">{toast}</p>}
    </div>
  )
}
