import { useEffect, useState } from 'react'
import type { Services } from '../firebase/createServices'
import type { FrienzyEvent } from '../domain/event'
import { loadEventPeople } from '../people/loadEventPeople'
import type { PublicProfile } from '../people/publicProfile'
import type { PresenceStatus } from './types'

/** I partecipanti confermati dell'evento e la presenza già segnata per ciascuno (uid → stato). */
export function usePresenceList(services: Services, event: FrienzyEvent, version: number) {
  const [state, setState] = useState<{ loading: boolean; people: PublicProfile[]; marks: Record<string, PresenceStatus> }>({ loading: true, people: [], marks: {} })
  useEffect(() => {
    let active = true
    Promise.all([loadEventPeople(services.users, services.participations, event), services.attendance.listPresenceByEvent(event.id)])
      .then(([people, presences]) => {
        if (!active) return
        const marks = Object.fromEntries(presences.map((p) => [p.uid, p.stato]))
        setState({ loading: false, people: people.filter((p) => p.ruolo !== 'organizzatore'), marks })
      })
      .catch(() => active && setState({ loading: false, people: [], marks: {} }))
    return () => {
      active = false
    }
  }, [services, event, version])
  return state
}
