import type { PeriodGroup } from '../events/periods'
import type { Attendance } from '../events/loadAttendance'
import { EventCard } from '../ui/EventCard'

interface Props {
  groups: PeriodGroup[]
  attendance: Record<string, Attendance>
  onOpen: (eventId: string) => void
}

// Le sezioni Oggi / Domani / Questa settimana / Più avanti, ognuna con le sue schede.
export function EventPeriods({ groups, attendance, onOpen }: Props) {
  return (
    <>
      {groups.map((group) => (
        <section key={group.id} className="period" aria-label={group.title}>
          <h2>{group.title}</h2>
          <ul className="event-list">
            {group.events.map((event) => (
              <li key={event.id}><EventCard event={event} attendance={attendance[event.id]} onOpen={() => onOpen(event.id)} /></li>
            ))}
          </ul>
        </section>
      ))}
    </>
  )
}
