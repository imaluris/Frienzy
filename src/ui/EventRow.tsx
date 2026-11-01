import type { FrienzyEvent } from '../domain/event'
import { EVENT_TYPE_EMOJI } from '../domain/eventTypes'
import { friendlyWhen } from '../events/dayBadge'
import { Icon } from './Icon'

interface Props {
  event: FrienzyEvent
  selected?: boolean
  onOpen: () => void
}

// Riga compatta (per la scheda della mappa): quadrato col tipo, titolo, quando e dove. Tutta la riga apre il dettaglio.
export function EventRow({ event, selected = false, onOpen }: Props) {
  return (
    <button type="button" className={`event-row${selected ? ' is-selected' : ''}`} onClick={onOpen}>
      <span className={`event-row-cover cover-${event.tipo}`} aria-hidden="true">{EVENT_TYPE_EMOJI[event.tipo]}</span>
      <span className="event-row-body">
        <span className="event-row-title">{event.titolo}</span>
        <span className="event-card-meta"><Icon name="clock" size={16} />{friendlyWhen(event.dataOra)}</span>
        <span className="event-card-meta"><Icon name="pin" size={16} /><span className="truncate">{event.zonaNome}</span></span>
      </span>
    </button>
  )
}
