import { useMemo, useState } from 'react'
import { buildDiscover } from '../discover/sections'
import type { EventTypeId } from '../domain/eventTypes'
import { useServices } from '../app/ServicesContext'
import { groupByPeriod } from '../events/periods'
import { searchEvents } from '../events/search'
import { useAttendance } from '../events/useAttendance'
import { useUpcomingEvents } from '../events/useUpcomingEvents'
import { filterEvents, NO_FILTERS, type EventFilters } from '../filters/eventFilters'
import { useMyPosition } from '../filters/useMyPosition'
import { EmptyState } from '../ui/EmptyState'
import { PullToRefresh } from '../ui/PullToRefresh'
import { LoadFailed } from '../ui/LoadFailed'
import { EventListSkeleton } from '../ui/EventCardSkeleton'
import { DiscoverRails } from './DiscoverRails'
import { EventPeriods } from './EventPeriods'
import { FiltersBar } from './FiltersBar'
import { HomeHeader } from './HomeHeader'
import { SearchField } from './SearchField'

interface Props {
  uid: string
  name: string
  interessi: EventTypeId[]
  onOpen: (eventId: string) => void
  onCreate: () => void
}

// Schermata Eventi: saluto, ricerca, filtri per tipo e le schede divise per periodo (oggi, domani...).
export function EventListScreen({ uid, name, interessi, onOpen, onCreate }: Props) {
  const { events } = useServices()
  const { loading, list, failed, refresh } = useUpcomingEvents(events)
  const [filters, setFilters] = useState<EventFilters>(NO_FILTERS)
  const [query, setQuery] = useState('')
  const { state: position, ask } = useMyPosition()
  const shown = useMemo(() => searchEvents(filterEvents(list, filters), query), [list, filters, query])
  const groups = useMemo(() => groupByPeriod(shown), [shown])
  const attendance = useAttendance(shown)
  const browsing = query.trim() === '' && filters === NO_FILTERS
  const point = position.status === 'ok' ? position.point : null
  const sections = useMemo(() => buildDiscover({ events: list, interessi, uid, position: point, now: new Date() }), [list, interessi, uid, point])
  const ready = !loading && !failed

  return (
    <PullToRefresh onRefresh={refresh}>
      <HomeHeader name={name} />
      <section className="home-body" aria-label="Eventi in programma">
        <SearchField value={query} onChange={setQuery} />
        <FiltersBar filters={filters} onChange={setFilters} position={position} onAskPosition={ask} />
        {loading && <EventListSkeleton />}
        {failed && <LoadFailed text="Non riesco a caricare gli eventi." />}
        {ready && list.length === 0 && (
          <EmptyState art="no-events" text="Nessun evento in programma.">
            <button type="button" onClick={onCreate}>Organizza il primo</button>
          </EmptyState>
        )}
        {ready && list.length > 0 && shown.length === 0 && (
          <EmptyState art="no-results" text={query.trim() ? `Nessun risultato per “${query.trim()}”.` : 'Nessun evento con questi filtri.'} />
        )}
        {ready && browsing && <DiscoverRails sections={sections} onOpen={onOpen} />}
        <EventPeriods groups={groups} attendance={attendance} onOpen={onOpen} />
      </section>
    </PullToRefresh>
  )
}
