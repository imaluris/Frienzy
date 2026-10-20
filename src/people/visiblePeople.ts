import type { FrienzyEvent } from '../domain/event'
import type { Participation } from '../domain/participation'
import type { PersonRole } from './publicProfile'

export interface VisiblePerson {
  uid: string
  ruolo: PersonRole
}

/**
 * Chi si può vedere nell'evento: l'organizzatore (sempre per primo) e i partecipanti CONFERMATI.
 * Chi ha solo una richiesta o è stato rifiutato non compare, qualunque sia lo spettatore.
 */
export function visiblePeople(event: FrienzyEvent, participations: Participation[]): VisiblePerson[] {
  const people: VisiblePerson[] = [{ uid: event.organizzatoreId, ruolo: 'organizzatore' }]
  const seen = new Set([event.organizzatoreId])
  for (const p of participations) {
    if (p.stato !== 'confermato' || seen.has(p.uid)) continue
    seen.add(p.uid)
    people.push({ uid: p.uid, ruolo: 'partecipante' })
  }
  return people
}
