import { useMemo, useState } from 'react'
import { useServices } from '../app/ServicesContext'
import { useUpcomingEvents } from '../events/useUpcomingEvents'
import { filterEvents, NO_FILTERS, type EventFilters } from '../filters/eventFilters'
import { useMyPosition } from '../filters/useMyPosition'
import { EmptyState } from '../ui/EmptyState'
import { EventCard } from '../ui/EventCard'
import { FiltersBar } from './FiltersBar'

interface Props {
  onOpen: (eventId: string) => void
}

// Elenco degli eventi futuri, dal più vicino. Toccando una scheda si apre il dettaglio.
export function EventListScreen({ onOpen }: Props) {
  const { events } = useServices()
  const { loading, list, failed } = useUpcomingEvents(events)
  const [filters, setFilters] = useState<EventFilters>(NO_FILTERS)
  const { state: position, ask } = useMyPosition()
  const shown = useMemo(() => filterEvents(list, filters), [list, filters])

  return (
    <section className="screen">
      <FiltersBar filters={filters} onChange={setFilters} position={position} onAskPosition={ask} />
      {loading && <p className="loading">Caricamento…</p>}
      {failed && <p role="alert" className="error">Non riesco a caricare gli eventi.</p>}
      {!loading && !failed && list.length === 0 && <EmptyState emoji="🗓️" text="Nessun evento in programma." />}
      {!loading && !failed && list.length > 0 && shown.length === 0 && <EmptyState emoji="🔍" text="Nessun evento con questi filtri." />}
      <ul className="event-list">
        {shown.map((event) => (
          <li key={event.id}><EventCard event={event} onOpen={() => onOpen(event.id)} /></li>
        ))}
      </ul>
    </section>
  )
}
