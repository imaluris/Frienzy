import { useEffect, useState } from 'react'
import type { Services } from '../firebase/createServices'
import type { FrienzyEvent } from '../domain/event'
import type { Participation } from '../domain/participation'
import { toPublicProfile } from '../people/publicProfile'

export interface PendingRequest {
  uid: string
  nome: string
  eta: number
}

export interface ParticipationData {
  loaded: boolean
  mine: Participation | null
  confirmedCount: number
  /** Posizione in lista d'attesa (1 = il prossimo), se chi guarda è in lista. */
  position: number | null
  /** Richieste in attesa: le vede e le carica solo l'organizzatore. */
  requests: PendingRequest[]
}

const EMPTY: ParticipationData = { loaded: false, mine: null, confirmedCount: 0, position: null, requests: [] }

async function loadRequests(services: Services, all: Participation[]): Promise<PendingRequest[]> {
  const pending = all.filter((p) => p.stato === 'richiesta')
  const found = await Promise.all(
    pending.map(async (p) => {
      const profile = await services.users.getById(p.uid)
      return profile ? { uid: p.uid, nome: profile.nome, eta: toPublicProfile(profile, 'partecipante').eta } : null
    }),
  )
  return found.filter((r): r is PendingRequest => r !== null)
}

/**
 * Carica la situazione di partecipazione per chi guarda. L'organizzatore legge tutte le
 * iscrizioni; gli altri solo la propria e l'elenco dei confermati (le regole non ne permettono di più).
 * `refreshKey` cambia dopo ogni azione e fa ricaricare i dati.
 */
export function useEventParticipation(services: Services, event: FrienzyEvent | null, uid: string | null, refreshKey: number) {
  const [data, setData] = useState<ParticipationData>(EMPTY)
  useEffect(() => {
    if (!event || !uid) return
    let active = true
    const { participations } = services
    const load = async (): Promise<ParticipationData> => {
      if (event.organizzatoreId === uid) {
        const all = await participations.listByEvent(event.id)
        const confirmedCount = all.filter((p) => p.stato === 'confermato').length
        return { loaded: true, mine: null, confirmedCount, position: null, requests: await loadRequests(services, all) }
      }
      const [mine, confirmed] = await Promise.all([participations.get(event.id, uid), participations.listConfirmed(event.id)])
      const position = mine?.stato === 'inAttesa' ? await participations.waitlistPosition(event.id, uid) : null
      return { loaded: true, mine, confirmedCount: confirmed.length, position, requests: [] }
    }
    load()
      .then((next) => active && setData(next))
      .catch(() => active && setData({ ...EMPTY, loaded: true }))
    return () => {
      active = false
    }
  }, [services, event, uid, refreshKey])
  return data
}
