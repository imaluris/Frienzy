import { useMemo, useState } from 'react'
import { useServices } from '../app/ServicesContext'
import { EVENT_TYPE_EMOJI } from '../domain/eventTypes'
import { formatEventDate } from '../events/format'
import { useUpcomingEvents } from '../events/useUpcomingEvents'
import { filterEvents, NO_FILTERS, type EventFilters } from '../filters/eventFilters'
import { useMyPosition } from '../filters/useMyPosition'
import { FiltersBar } from './FiltersBar'

interface Props {
  onOpen: (eventId: string) => void
  onBack: () => void
}

// Elenco degli eventi futuri, dal più vicino. Toccando una scheda si apre il dettaglio.
export function EventListScreen({ onOpen, onBack }: Props) {
  const { events } = useServices()
  const { loading, list, failed } = useUpcomingEvents(events)
  const [filters, setFilters] = useState<EventFilters>(NO_FILTERS)
  const { state: position, ask } = useMyPosition()
  const shown = useMemo(() => filterEvents(list, filters), [list, filters])

  return (
    <section className="card">
      <h2>Eventi in programma</h2>
      <FiltersBar filters={filters} onChange={setFilters} position={position} onAskPosition={ask} />
      {loading && <p>Caricamento…</p>}
      {failed && <p role="alert" className="error">Non riesco a caricare gli eventi.</p>}
      {!loading && !failed && list.length === 0 && <p>Nessun evento in programma.</p>}
      {!loading && !failed && list.length > 0 && shown.length === 0 && <p>Nessun evento con questi filtri.</p>}
      <ul className="event-list">
        {shown.map((event) => (
          <li key={event.id}>
            <button type="button" className="event-item" onClick={() => onOpen(event.id)}>
              <span aria-hidden="true">{EVENT_TYPE_EMOJI[event.tipo]}</span> {event.titolo}
              <small>{formatEventDate(event.dataOra)} · {event.zonaNome}</small>
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className="link" onClick={onBack}>Indietro</button>
    </section>
  )
}
