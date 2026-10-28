import { useCallback, useMemo, useState } from 'react'
import { useServices } from '../app/ServicesContext'
import { useUpcomingEvents } from '../events/useUpcomingEvents'
import { useMyPosition } from '../filters/useMyPosition'
import { EventMap } from '../map/EventMap'
import { eventsToMarkers } from '../map/markers'
import { positionMessage } from '../map/positionMessage'

interface Props {
  onOpen: (eventId: string) => void
}

// Mappa degli eventi futuri. Toccando un marker si apre un popup con il pulsante verso il dettaglio.
export function MapScreen({ onOpen }: Props) {
  const { events } = useServices()
  const { loading, list, failed } = useUpcomingEvents(events)
  const { state, ask } = useMyPosition()
  const [tilesFailed, setTilesFailed] = useState(false)
  const markers = useMemo(() => eventsToMarkers(list), [list])
  const onTilesFailed = useCallback(() => setTilesFailed(true), [])
  const note = positionMessage(state)

  return (
    <section className="map-screen">
      {loading && <p className="loading">Caricamento…</p>}
      {failed && <p role="alert" className="error">Non riesco a caricare gli eventi.</p>}
      {!loading && !failed && (
        <>
          <div className="locate-bar">
            <button type="button" className="locate-button" onClick={ask}>Centra su di me</button>
          </div>
          <div className="map-wrap">
            <EventMap markers={markers} me={state.status === 'ok' ? state.point : null} onSelect={onOpen} onTilesFailed={onTilesFailed} />
            {markers.length === 0 && <p className="map-empty">Nessun evento in programma per ora.</p>}
          </div>
          {note && <p className="hint" role="status">{note}</p>}
          {tilesFailed && <p className="hint" role="status">Lo sfondo della mappa non si carica (serve internet). I punti degli eventi restano visibili.</p>}
        </>
      )}
    </section>
  )
}
