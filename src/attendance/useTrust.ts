import { useEffect, useState } from 'react'
import type { Services } from '../firebase/createServices'
import { reliability, starsSummary, type Reliability, type StarsSummary } from './reliability'

export interface Trust {
  loading: boolean
  reliability: Reliability
  /** Voti ricevuti come organizzatore (li vede solo il proprietario del profilo). */
  stars: StarsSummary
}

const EMPTY: Trust = { loading: true, reliability: { done: 0, marked: 0, percent: null }, stars: { count: 0, average: null } }

/** Riepilogo per il Profilo: eventi fatti, affidabilità e voto medio. Se il caricamento fallisce restano i valori vuoti. */
export function useTrust(services: Services, uid: string): Trust {
  const [trust, setTrust] = useState<Trust>(EMPTY)
  useEffect(() => {
    let active = true
    Promise.all([services.attendance.listPresenceByUser(uid), services.attendance.listRatingsForOrganizer(uid)])
      .then(([presences, ratings]) => active && setTrust({ loading: false, reliability: reliability(presences), stars: starsSummary(ratings) }))
      .catch(() => active && setTrust({ ...EMPTY, loading: false }))
    return () => {
      active = false
    }
  }, [services, uid])
  return trust
}
