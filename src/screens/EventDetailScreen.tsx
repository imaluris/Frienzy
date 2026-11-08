import { useEffect, useState } from 'react'
import { useServices } from '../app/ServicesContext'
import type { FrienzyEvent } from '../domain/event'
import { useToast } from '../feedback/ToastContext'
import { headerProgress } from '../events/detailScroll'
import { shareEvent } from '../events/share'
import { eventOptions } from '../safety/options'
import { useBlocks } from '../safety/BlocksContext'
import { useEventPeople } from '../people/useEventPeople'
import { useExactPlace } from '../place/useExactPlace'
import { effectiveView } from '../participation/actionBar'
import { decideView } from '../participation/participationView'
import { useEventParticipation } from '../participation/useEventParticipation'
import { EmptyState } from '../ui/EmptyState'
import { useScrollY } from '../ui/useScrollY'
import { ChatLink } from './ChatLink'
import { ActionBar } from './ActionBar'
import { DetailTopBar } from './DetailTopBar'
import { EventAreaMap } from './EventAreaMap'
import { EventHero } from './EventHero'
import { EventInfo } from './EventInfo'
import { EventPeople } from './EventPeople'
import { OrganizerSheet } from './OrganizerSheet'
import { SafetyMenu } from './SafetyMenu'
import { StatusNote } from './StatusNote'

const COVER_HEIGHT = 296

const organizerOf = (people: { uid: string; nome: string; ruolo: string }[]) => people.find((p) => p.ruolo === 'organizzatore') ?? null

// Dettaglio di un evento: la zona per tutti; l'indirizzo esatto solo a organizzatore e confermati.
export function EventDetailScreen({ eventId, onBack, onOpenChat }: { eventId: string; onBack: () => void; onOpenChat: () => void }) {
  const services = useServices()
  const { show } = useToast()
  const { events } = services
  const [version, setVersion] = useState(0) // sale a ogni azione: fa ricaricare evento, persone e luogo
  const [state, setState] = useState<{ loading: boolean; event: FrienzyEvent | null }>({ loading: true, event: null })
  const [managing, setManaging] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { hidden } = useBlocks()
  const scrollY = useScrollY()
  // Se chi organizza è bloccato (o mi ha bloccato) l'evento non esiste più per me, anche aprendolo da un collegamento.
  const event = state.event && !hidden.has(state.event.organizzatoreId) ? state.event : null

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

  const people = useEventPeople(services, event)
  const place = useExactPlace(services, event?.id ?? null, version)
  const uid = services.auth.currentUid()
  const participation = useEventParticipation(services, event, uid, version)
  const reload = () => setVersion((v) => v + 1)

  async function share() {
    if (!event) return
    const result = await shareEvent(event)
    if (result === 'copied') show('Testo copiato: incollalo dove vuoi')
    if (result === 'unavailable') show('Condivisione non disponibile su questo dispositivo')
  }

  const view = event && uid ? effectiveView(event.stato, decideView({ event, uid, mine: participation.mine, confirmedCount: participation.confirmedCount })) : null
  return (
    <div className="detail-page">
      <DetailTopBar title={event?.titolo ?? ''} progress={event ? headerProgress(scrollY, COVER_HEIGHT) : 1} onBack={onBack} onShare={event ? share : null} onMore={event && uid && event.organizzatoreId !== uid ? () => setMenuOpen(true) : null} />
      {state.loading && <p className="loading detail-loading">Caricamento…</p>}
      {!state.loading && !event && (
        <div className="detail-missing">
          <EmptyState art="no-results" text="Evento non trovato."><p role="alert" className="error">Questo evento non esiste più.</p></EmptyState>
        </div>
      )}
      {event && (
        <>
          <EventHero event={event} scrollY={scrollY} />
          <div className="detail-body">
            {view && <StatusNote view={view} position={participation.position} />}
            <EventInfo event={event} place={place} />
            {view && <ChatLink open={view === 'organizzatore' || view === 'confermato'} onOpen={onOpenChat} />}
            <EventPeople people={people} meUid={uid} />
            <EventAreaMap lat={event.latApprossimata} lng={event.lngApprossimata} />
          </div>
          {uid && view && participation.loaded && (
            <ActionBar view={view} event={event} uid={uid} confirmedCount={participation.confirmedCount} pendingCount={participation.requests.length} onManage={() => setManaging(true)} onChanged={reload} />
          )}
          {menuOpen && uid && (
            <SafetyMenu
              title="Altre azioni"
              options={eventOptions(event.id, organizerOf(people), uid)}
              onClose={() => setMenuOpen(false)}
              onBlocked={(blocked) => blocked === event.organizzatoreId && onBack()}
            />
          )}
          {managing && uid && (
            <OrganizerSheet event={event} uid={uid} requests={participation.requests} confirmedCount={participation.confirmedCount} onChanged={reload} onClose={() => setManaging(false)} />
          )}
        </>
      )}
    </div>
  )
}
