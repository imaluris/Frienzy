import type { EventTypeId } from '../domain/eventTypes'
import { CoverArt } from '../art/CoverArt'
import { dayBadge } from '../events/dayBadge'

// Copertina di un evento: illustrazione originale per tipo (variante scelta dall'id) e, se serve, il badge data.
export function EventCover({ tipo, seedId, date, className = '' }: { tipo: EventTypeId; seedId: string; date?: Date; className?: string }) {
  const badge = date ? dayBadge(date) : null
  return (
    <span className={`cover cover-${tipo} ${className}`} aria-hidden="true">
      <CoverArt tipo={tipo} seedId={seedId} />
      {badge && (
        <span className="date-badge">
          <span className="date-badge-day">{badge.day}</span>
          <span className="date-badge-month">{badge.month}</span>
        </span>
      )}
    </span>
  )
}
