import type { EventTypeId } from '../domain/eventTypes'
import { EVENT_TYPE_EMOJI } from '../domain/eventTypes'
import { dayBadge } from '../events/dayBadge'

// Copertina provvisoria: gradiente per tipo di evento con cerchi decorativi e l'emoji del tipo.
// (Le illustrazioni complete arrivano più avanti: i componenti che la usano non cambiano.)
export function EventCover({ tipo, date, className = '' }: { tipo: EventTypeId; date?: Date; className?: string }) {
  const badge = date ? dayBadge(date) : null
  return (
    <span className={`cover cover-${tipo} ${className}`} aria-hidden="true">
      <span className="cover-blob cover-blob-a" />
      <span className="cover-blob cover-blob-b" />
      <span className="cover-emoji">{EVENT_TYPE_EMOJI[tipo]}</span>
      {badge && (
        <span className="date-badge">
          <span className="date-badge-day">{badge.day}</span>
          <span className="date-badge-month">{badge.month}</span>
        </span>
      )}
    </span>
  )
}
