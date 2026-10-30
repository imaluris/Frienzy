import { useEffect, useState } from 'react'
import { useServices } from '../app/ServicesContext'
import type { FrienzyEvent } from '../domain/event'
import { loadAttendance, type Attendance } from './loadAttendance'

/** Per ogni evento dell'elenco, chi c'è. Le schede si disegnano subito e gli avatar arrivano appena pronti. */
export function useAttendance(events: FrienzyEvent[]): Record<string, Attendance> {
  const { participations, users } = useServices()
  const [byEvent, setByEvent] = useState<Record<string, Attendance>>({})

  useEffect(() => {
    let active = true
    for (const event of events) {
      loadAttendance(participations, users, event)
        .then((a) => active && setByEvent((prev) => ({ ...prev, [event.id]: a })))
        .catch(() => undefined) // senza avatar la scheda resta perfettamente usabile
    }
    return () => {
      active = false
    }
  }, [events, participations, users])

  return byEvent
}
