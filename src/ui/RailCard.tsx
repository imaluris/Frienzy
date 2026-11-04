import type { FrienzyEvent } from '../domain/event'
import { friendlyWhen } from '../events/dayBadge'
import { EventCover } from './EventCover'
import { Icon } from './Icon'
import { SaveButton } from './SaveButton'

interface Props {
  event: FrienzyEvent
  onOpen: () => void
  /** Testo in più accanto al luogo, es. "800 m" nella fila "Vicino a te". */
  extra?: string
}

// Scheda stretta per le file a scorrimento orizzontale: copertina con data e cuore, titolo su due righe, quando e dove.
export function RailCard({ event, onOpen, extra }: Props) {
  return (
    <article className="rail-card">
      <button type="button" className="rail-card-main" onClick={onOpen}>
        <EventCover tipo={event.tipo} seedId={event.id} date={event.dataOra} className="rail-cover" />
        <span className="rail-card-body">
          <span className="rail-card-title">{event.titolo}</span>
          <span className="event-card-meta"><Icon name="clock" size={16} />{friendlyWhen(event.dataOra)}</span>
          <span className="event-card-meta">
            <Icon name="pin" size={16} />
            <span className="truncate">{event.zonaNome}</span>
            {extra && <span className="rail-extra">{extra}</span>}
          </span>
        </span>
      </button>
      <SaveButton eventId={event.id} />
    </article>
  )
}
