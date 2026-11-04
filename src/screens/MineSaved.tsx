import { useMemo } from 'react'
import { useServices } from '../app/ServicesContext'
import { useAttendance } from '../events/useAttendance'
import { useUpcomingEvents } from '../events/useUpcomingEvents'
import { savedEvents } from '../saved/savedEvents'
import { useSaved } from '../saved/SavedContext'
import { EmptyState } from '../ui/EmptyState'
import { EventCard } from '../ui/EventCard'
import { LoadFailed } from '../ui/LoadFailed'

// Scheda "Salvati": gli eventi col cuore ancora in programma, l'ultimo salvato per primo.
export function MineSaved({ onOpen }: { onOpen: (eventId: string) => void }) {
  const { events } = useServices()
  const { ids } = useSaved()
  const { loading, list, failed } = useUpcomingEvents(events)
  const shown = useMemo(() => savedEvents(list, ids), [list, ids])
  const attendance = useAttendance(shown)
  return (
    <>
      {failed && <LoadFailed text="Non riesco a caricare gli eventi salvati." />}
      {!loading && !failed && shown.length === 0 && (
        <EmptyState art="no-events" text="Non hai ancora salvato nessun evento. Tocca il cuore su una scheda per ritrovarla qui." />
      )}
      <ul className="event-list">
        {shown.map((event) => <li key={event.id}><EventCard event={event} attendance={attendance[event.id]} onOpen={() => onOpen(event.id)} /></li>)}
      </ul>
    </>
  )
}
