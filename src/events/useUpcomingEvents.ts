import { useEffect, useState } from 'react'
import type { EventRepository } from '../data/eventRepository'
import type { FrienzyEvent } from '../domain/event'
import { upcomingEvents } from './listing'

/** Carica gli eventi dal repository e li restituisce già filtrati e ordinati. */
export function useUpcomingEvents(events: EventRepository) {
  const [state, setState] = useState<{ loading: boolean; list: FrienzyEvent[]; failed: boolean }>({
    loading: true,
    list: [],
    failed: false,
  })

  useEffect(() => {
    let active = true
    events
      .list()
      .then((all) => active && setState({ loading: false, list: upcomingEvents(all), failed: false }))
      .catch(() => active && setState({ loading: false, list: [], failed: true }))
    return () => {
      active = false
    }
  }, [events])

  return state
}
