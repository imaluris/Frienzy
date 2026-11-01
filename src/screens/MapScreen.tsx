import { useCallback, useMemo, useState } from 'react'
import { useServices } from '../app/ServicesContext'
import type { EventTypeId } from '../domain/eventTypes'
import { searchEvents } from '../events/search'
import { useUpcomingEvents } from '../events/useUpcomingEvents'
import { filterEvents, NO_FILTERS } from '../filters/eventFilters'
import { useMyPosition } from '../filters/useMyPosition'
import { EventMap } from '../map/EventMap'
import { eventsToMarkers } from '../map/markers'
import { positionMessage } from '../map/positionMessage'
import type { Snap } from '../map/sheetSnap'
import { MapSheet } from './MapSheet'
import { MapTop } from './MapTop'

interface Props {
  onOpen: (eventId: string) => void
}

// Mappa a tutto schermo: ricerca e chip in alto, scheda a scorrimento in basso. Toccando un segnaposto si sceglie l'evento.
export function MapScreen({ onOpen }: Props) {
  const { events } = useServices()
  const { loading, list, failed } = useUpcomingEvents(events)
  const { state, ask } = useMyPosition()
  const [tilesFailed, setTilesFailed] = useState(false)
  const [query, setQuery] = useState('')
  const [types, setTypes] = useState<EventTypeId[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [snap, setSnap] = useState<Snap>('closed')

  const shown = useMemo(() => searchEvents(filterEvents(list, { ...NO_FILTERS, tipi: types }), query), [list, types, query])
  const markers = useMemo(() => eventsToMarkers(shown), [shown])
  const selected = shown.find((e) => e.id === selectedId) ?? null
  const note = positionMessage(state)

  const select = useCallback((id: string) => { setSelectedId(id); setSnap('half') }, [])
  const deselect = useCallback(() => { setSelectedId(null); setSnap('closed') }, [])
  const onTilesFailed = useCallback(() => setTilesFailed(true), [])

  return (
    <section className="map-screen" aria-label="Mappa degli eventi">
      <EventMap markers={markers} selectedId={selected?.id ?? null} me={state.status === 'ok' ? state.point : null} onSelect={select} onDeselect={deselect} onTilesFailed={onTilesFailed} />
      <MapTop query={query} onQuery={setQuery} types={types} onTypes={setTypes} />
      {loading && <p className="map-banner loading">Caricamento…</p>}
      {failed && <p role="alert" className="map-banner error">Non riesco a caricare gli eventi.</p>}
      {!loading && !failed && markers.length === 0 && <p className="map-banner">Nessun evento da mostrare.</p>}
      {note && <p className="map-banner" role="status">{note}</p>}
      {tilesFailed && <p className="map-banner" role="status">Sfondo della mappa non disponibile (serve internet).</p>}
      <MapSheet snap={snap} onSnap={setSnap} events={shown} selected={selected} onOpen={onOpen} onLocate={ask} />
    </section>
  )
}
