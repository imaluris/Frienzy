import type { FrienzyEvent } from '../domain/event'
import { EVENT_TYPE_EMOJI } from '../domain/eventTypes'
import { eventBadges } from '../events/badges'
import { friendlyWhen } from '../events/dayBadge'
import { parallaxOffset } from '../events/detailScroll'
import { EventCover } from '../ui/EventCover'
import { Icon } from '../ui/Icon'
import { prefersReducedMotion } from '../ui/useScrollY'

const label = (id: string) => id.charAt(0).toUpperCase() + id.slice(1)

// Copertina grande con titolo sopra (su una sfumatura scura per leggerlo bene) e parallasse leggera.
export function EventHero({ event, scrollY }: { event: FrienzyEvent; scrollY: number }) {
  const shift = parallaxOffset(scrollY, prefersReducedMotion())
  return (
    <div className="detail-hero">
      <div className="detail-hero-art" style={{ transform: `translateY(${shift}px)` }}>
        <EventCover tipo={event.tipo} />
      </div>
      <div className="detail-hero-scrim" />
      <div className="detail-hero-text">
        <span className="event-card-badges">
          <span className="badge badge-hero"><span aria-hidden="true">{EVENT_TYPE_EMOJI[event.tipo]}</span> {label(event.tipo)}</span>
          {eventBadges(event).map((b) => <span key={b.label} className={`badge badge-${b.tone}`}>{b.label}</span>)}
        </span>
        <h2 className="detail-title">{event.titolo}</h2>
        <p className="detail-when"><Icon name="clock" size={16} />{friendlyWhen(event.dataOra)}</p>
      </div>
    </div>
  )
}
