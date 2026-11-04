import type { FrienzyEvent } from '../domain/event'
import { EmptyState } from '../ui/EmptyState'
import { EventCard } from '../ui/EventCard'

interface Props {
  events: FrienzyEvent[]
  showEmpty: boolean
  onOpen: (eventId: string) => void
  onCancel: (eventId: string) => void
}

// Scheda "Organizzo": i miei eventi, con il link per annullare quelli ancora attivi.
export function MineOrganized({ events, showEmpty, onOpen, onCancel }: Props) {
  return (
    <>
      {showEmpty && events.length === 0 && <EmptyState art="no-organized" text="Non organizzi ancora nessun evento." />}
      <ul className="event-list">
        {events.map((event) => (
          <li key={event.id}>
            <EventCard
              event={event}
              onOpen={() => onOpen(event.id)}
              footer={event.stato !== 'annullato' && (
                <button type="button" className="link" onClick={() => onCancel(event.id)}>Annulla evento</button>
              )}
            />
          </li>
        ))}
      </ul>
    </>
  )
}
