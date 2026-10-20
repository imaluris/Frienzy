import { useEffect, useState } from 'react'
import type { Services } from '../firebase/createServices'
import type { FrienzyEvent } from '../domain/event'
import { loadEventPeople } from './loadEventPeople'
import type { PublicProfile } from './publicProfile'

/** Carica le persone visibili di un evento; se fallisce restituisce un elenco vuoto. */
export function useEventPeople(services: Services, event: FrienzyEvent | null) {
  const [people, setPeople] = useState<PublicProfile[]>([])
  useEffect(() => {
    if (!event) return
    let active = true
    loadEventPeople(services.users, services.participations, event)
      .then((list) => active && setPeople(list))
      .catch(() => active && setPeople([]))
    return () => {
      active = false
    }
  }, [services, event])
  return people
}
