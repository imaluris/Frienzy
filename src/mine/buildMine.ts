import type { FrienzyEvent } from '../domain/event'
import type { Participation } from '../domain/participation'

export interface MyJoined {
  event: FrienzyEvent
  participation: Participation
}

export interface Mine {
  organized: FrienzyEvent[]
  joined: MyJoined[]
}

const byDate = (a: FrienzyEvent, b: FrienzyEvent) => a.dataOra.getTime() - b.dataOra.getTime()

/**
 * Da tutti gli eventi e dalle mie partecipazioni ricava le due liste della schermata.
 * Funzione pura. Gli eventi che organizzo non compaiono tra le iscrizioni;
 * una partecipazione il cui evento non si trova viene saltata.
 */
export function buildMine(allEvents: FrienzyEvent[], participations: Participation[], uid: string): Mine {
  const organized = allEvents.filter((e) => e.organizzatoreId === uid).sort(byDate)
  const byId = new Map(allEvents.map((e) => [e.id, e]))
  const joined = participations
    .map((participation) => ({ event: byId.get(participation.eventId), participation }))
    .filter((j): j is MyJoined => j.event !== undefined && j.event.organizzatoreId !== uid)
    .sort((a, b) => byDate(a.event, b.event))
  return { organized, joined }
}
