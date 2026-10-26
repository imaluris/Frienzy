import { useMemo } from 'react'
import { useServices } from '../app/ServicesContext'
import { useUpcomingEvents } from '../events/useUpcomingEvents'
import { EventMap } from '../map/EventMap'
import { eventsToMarkers } from '../map/markers'

interface Props {
  onOpen: (eventId: string) => void
}

// Mappa degli eventi futuri. Toccando un marker si apre il dettaglio.
export function MapScreen({ onOpen }: Props) {
  const { events } = useServices()
  const { loading, list, failed } = useUpcomingEvents(events)
  const markers = useMemo(() => eventsToMarkers(list), [list])

  return (
    <section className="card">
      {loading && <p className="loading">Caricamento…</p>}
      {failed && <p role="alert" className="error">Non riesco a caricare gli eventi.</p>}
      {!loading && !failed && <EventMap markers={markers} onSelect={onOpen} />}
    </section>
  )
}
