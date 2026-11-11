import type { EventTypeId } from '../domain/eventTypes'
import type { LatLng } from '../events/geohashDecode'
import type { Services } from '../firebase/createServices'
import { hiddenUids, withoutBlockedEvents } from '../safety/blocking'
import { buildAlerts } from './buildAlerts'
import type { AppAlert } from './alertTypes'

type Ports = Pick<Services, 'events' | 'participations' | 'notifications' | 'seen' | 'blocks'>

export interface LoadedAlerts {
  alerts: AppAlert[]
  seen: string[]
}

/**
 * Legge i dati e calcola gli avvisi. Letture volutamente poche (niente ascolti continui, per restare nelle quote gratuite):
 * eventi, le mie iscrizioni, preferenze, avvisi visti, blocchi; più una lettura delle iscrizioni per ogni mio evento aperto,
 * e solo se l'interruttore "Richieste" è acceso.
 */
export async function loadAlerts(ports: Ports, args: { uid: string; interessi: readonly EventTypeId[]; position: LatLng | null; now?: Date }): Promise<LoadedAlerts> {
  const { uid } = args
  const now = args.now ?? new Date()
  const [all, mine, prefs, seen, blockedByMe, blockedMe] = await Promise.all([
    ports.events.list(), ports.participations.listByUser(uid), ports.notifications.getPrefs(uid),
    ports.seen.get(uid), ports.blocks.listBlockedBy(uid), ports.blocks.listBlockers(uid),
  ])
  const hidden = hiddenUids(blockedByMe, blockedMe)
  const events = withoutBlockedEvents(all, hidden)

  const pendingCounts: Record<string, number> = {}
  if (prefs.richieste) {
    const organized = events.filter((e) => e.organizzatoreId === uid && e.stato === 'aperto' && e.dataOra.getTime() > now.getTime())
    const lists = await Promise.all(organized.map((e) => ports.participations.listByEvent(e.id)))
    organized.forEach((e, i) => { pendingCounts[e.id] = lists[i].filter((p) => p.stato === 'richiesta' && !hidden.has(p.uid)).length })
  }
  return { alerts: buildAlerts({ uid, interessi: args.interessi, prefs, now, events, myParticipations: mine, pendingCounts, position: args.position }), seen }
}
