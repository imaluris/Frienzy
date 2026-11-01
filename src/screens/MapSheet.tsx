import { useRef, type PointerEvent } from 'react'
import type { FrienzyEvent } from '../domain/event'
import { dragSnap, tapSnap, type Snap } from '../map/sheetSnap'
import { EventRow } from '../ui/EventRow'
import { Icon } from '../ui/Icon'

interface Props {
  snap: Snap
  onSnap: (snap: Snap) => void
  events: FrienzyEvent[]
  selected: FrienzyEvent | null
  onOpen: (eventId: string) => void
  onLocate: () => void
}

function summary(count: number): string {
  return count === 0 ? 'Nessun evento qui' : count === 1 ? '1 evento sulla mappa' : `${count} eventi sulla mappa`
}

// Scheda a tre altezze: chiusa (solo il riassunto), a metà (l'evento scelto) ed estesa (tutta la lista).
// La maniglia si tocca o si trascina; il pulsante tondo "Centra su di me" sale e scende con la scheda.
export function MapSheet({ snap, onSnap, events, selected, onOpen, onLocate }: Props) {
  const startY = useRef<number | null>(null)
  const dragged = useRef(false)

  function down(e: PointerEvent) {
    startY.current = e.clientY
    dragged.current = false
  }
  function up(e: PointerEvent) {
    if (startY.current === null) return
    const next = dragSnap(snap, e.clientY - startY.current)
    dragged.current = next !== snap
    startY.current = null
    if (dragged.current) onSnap(next)
  }
  function tap() {
    if (!dragged.current) onSnap(tapSnap(snap))
    dragged.current = false
  }

  return (
    <div className={`map-sheet snap-${snap}`}>
      <button type="button" className="locate-fab" aria-label="Centra su di me" onClick={onLocate}><Icon name="locate" size={24} /></button>
      <button type="button" className="sheet-grip" aria-label="Apri o chiudi l'elenco degli eventi" onPointerDown={down} onPointerUp={up} onClick={tap}>
        <span className="sheet-handle" aria-hidden="true" />
      </button>
      <p className="map-sheet-summary">{summary(events.length)}</p>
      {snap === 'half' && (
        <div className="map-sheet-body">
          {selected ? (
            <>
              <EventRow event={selected} selected onOpen={() => onOpen(selected.id)} />
              <button type="button" className="wide" onClick={() => onOpen(selected.id)}>Vedi evento</button>
            </>
          ) : (
            <p className="muted">Tocca un punto sulla mappa per vedere l'evento, oppure scorri verso l'alto per l'elenco.</p>
          )}
        </div>
      )}
      {snap === 'full' && (
        <div className="map-sheet-body map-sheet-list">
          {events.map((e) => <EventRow key={e.id} event={e} selected={e.id === selected?.id} onOpen={() => onOpen(e.id)} />)}
        </div>
      )}
    </div>
  )
}
