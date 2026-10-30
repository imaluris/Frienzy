import type { ReactNode } from 'react'
import type { FrienzyEvent } from '../domain/event'
import { eventBadges } from '../events/badges'
import { friendlyWhen } from '../events/dayBadge'
import type { Attendance } from '../events/loadAttendance'
import { AvatarStack } from './AvatarStack'
import { EventCover } from './EventCover'
import { Icon } from './Icon'
import { SaveButton } from './SaveButton'
import { SeatsMeter } from './SeatsMeter'

interface Props {
  event: FrienzyEvent
  onOpen: () => void
  /** Chi c'è già: se manca (non ancora caricato) la riga sociale non compare. */
  attendance?: Attendance
  /** Riga in più, es. lo stato della mia iscrizione. */
  note?: string
  footer?: ReactNode
}

// Scheda grande: copertina con badge data e cuore, titolo, quando, dove, avatar e posti. Tutta la scheda apre il dettaglio.
export function EventCard({ event, onOpen, attendance, note, footer }: Props) {
  const cancelled = event.stato === 'annullato'
  return (
    <article className={`event-card${cancelled ? ' is-cancelled' : ''}`}>
      <button type="button" className="event-card-main" onClick={onOpen}>
        <EventCover tipo={event.tipo} date={event.dataOra} />
        <span className="event-card-body">
          <span className="event-card-title">{event.titolo}</span>
          <span className="event-card-meta"><Icon name="clock" size={16} />{friendlyWhen(event.dataOra)}</span>
          <span className="event-card-meta"><Icon name="pin" size={16} /><span className="truncate">{event.zonaNome}</span></span>
          {attendance && !cancelled && (
            <span className="event-card-social">
              <AvatarStack names={attendance.names} />
              <SeatsMeter max={event.maxPartecipanti} confirmed={attendance.confirmed} />
            </span>
          )}
          <span className="event-card-badges">
            {eventBadges(event).map((b) => <span key={b.label} className={`badge badge-${b.tone}`}>{b.label}</span>)}
            {note && <span className="badge badge-neutral">{note}</span>}
          </span>
        </span>
      </button>
      {!cancelled && <SaveButton />}
      {footer}
    </article>
  )
}
