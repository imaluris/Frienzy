import { useMemo, useState } from 'react'
import { useServices } from '../app/ServicesContext'
import { groupByPeriod } from '../events/periods'
import { searchEvents } from '../events/search'
import { useAttendance } from '../events/useAttendance'
import { useUpcomingEvents } from '../events/useUpcomingEvents'
import { filterEvents, NO_FILTERS, type EventFilters } from '../filters/eventFilters'
import { useMyPosition } from '../filters/useMyPosition'
import { EmptyState } from '../ui/EmptyState'
import { EventListSkeleton } from '../ui/EventCardSkeleton'
import { EventPeriods } from './EventPeriods'
import { FiltersBar } from './FiltersBar'
import { HomeHeader } from './HomeHeader'
import { SearchField } from './SearchField'

interface Props {
  name: string
  onOpen: (eventId: string) => void
  onCreate: () => void
}

// Schermata Eventi: saluto, ricerca, filtri per tipo e le schede divise per periodo (oggi, domani...).
export function EventListScreen({ name, onOpen, onCreate }: Props) {
  const { events } = useServices()
  const { loading, list, failed } = useUpcomingEvents(events)
  const [filters, setFilters] = useState<EventFilters>(NO_FILTERS)
  const [query, setQuery] = useState('')
  const { state: position, ask } = useMyPosition()
  const shown = useMemo(() => searchEvents(filterEvents(list, filters), query), [list, filters, query])
  const groups = useMemo(() => groupByPeriod(shown), [shown])
  const attendance = useAttendance(shown)
  const ready = !loading && !failed

  return (
    <>
      <HomeHeader name={name} />
      <section className="home-body" aria-label="Eventi in programma">
        <SearchField value={query} onChange={setQuery} />
        <FiltersBar filters={filters} onChange={setFilters} position={position} onAskPosition={ask} />
        {loading && <EventListSkeleton />}
        {failed && <p role="alert" className="error">Non riesco a caricare gli eventi.</p>}
        {ready && list.length === 0 && (
          <EmptyState icon="calendar-empty" text="Nessun evento in programma.">
            <button type="button" onClick={onCreate}>Organizza il primo</button>
          </EmptyState>
        )}
        {ready && list.length > 0 && shown.length === 0 && (
          <EmptyState icon="search-empty" text={query.trim() ? `Nessun risultato per “${query.trim()}”.` : 'Nessun evento con questi filtri.'} />
        )}
        <EventPeriods groups={groups} attendance={attendance} onOpen={onOpen} />
      </section>
    </>
  )
}
