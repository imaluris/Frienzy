import { formatDistance } from '../discover/nearby'
import type { DiscoverSections } from '../discover/sections'
import { EventRail } from '../ui/EventRail'
import { RailCard } from '../ui/RailCard'

interface Props {
  sections: DiscoverSections
  onOpen: (eventId: string) => void
}

// Le file "Per te", "Vicino a te" e "Questo weekend": ogni fila sparisce se non ha eventi.
export function DiscoverRails({ sections, onOpen }: Props) {
  const { perTe, vicino, weekend } = sections
  return (
    <>
      {perTe.length > 0 && (
        <EventRail title="Per te">
          {perTe.map((event) => <li key={event.id}><RailCard event={event} onOpen={() => onOpen(event.id)} /></li>)}
        </EventRail>
      )}
      {vicino.length > 0 && (
        <EventRail title="Vicino a te">
          {vicino.map(({ event, km }) => <li key={event.id}><RailCard event={event} extra={formatDistance(km)} onOpen={() => onOpen(event.id)} /></li>)}
        </EventRail>
      )}
      {weekend.length > 0 && (
        <EventRail title="Questo weekend">
          {weekend.map((event) => <li key={event.id}><RailCard event={event} onOpen={() => onOpen(event.id)} /></li>)}
        </EventRail>
      )}
    </>
  )
}
