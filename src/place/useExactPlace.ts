import { useEffect, useState } from 'react'
import type { Services } from '../firebase/createServices'
import type { ExactPlace } from '../domain/event'

/** Il luogo esatto dell'evento per l'utente collegato, oppure null se non può vederlo. */
export function useExactPlace(services: Services, eventId: string | null): ExactPlace | null {
  const [place, setPlace] = useState<ExactPlace | null>(null)
  useEffect(() => {
    if (!eventId) return
    let active = true
    services.events
      .getExactPlace(eventId, services.auth.currentUid())
      .then((found) => active && setPlace(found))
      .catch(() => active && setPlace(null))
    return () => {
      active = false
    }
  }, [services, eventId])
  return place
}
