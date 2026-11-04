import { useCallback, useEffect, useState } from 'react'
import type { EventRepository } from '../data/eventRepository'
import type { FrienzyEvent } from '../domain/event'
import { upcomingEvents } from './listing'

interface State {
  loading: boolean
  list: FrienzyEvent[]
  failed: boolean
}

/** Carica gli eventi dal repository e li restituisce già filtrati e ordinati. `refresh` li rilegge (tira per aggiornare). */
export function useUpcomingEvents(events: EventRepository) {
  const [state, setState] = useState<State>({ loading: true, list: [], failed: false })

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

  // Riletture senza tornare allo scheletro: la lista resta visibile finché non arrivano i dati nuovi.
  const refresh = useCallback(async () => {
    try {
      const all = await events.list()
      setState({ loading: false, list: upcomingEvents(all), failed: false })
    } catch {
      setState((s) => ({ ...s, loading: false, failed: s.list.length === 0 }))
    }
  }, [events])

  return { ...state, refresh }
}
