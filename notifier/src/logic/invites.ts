import { geohashDistanceKm } from './geo'
import { wants } from './recipients'
import type { Contact, EventLite } from './types'

export const INVITE_RADIUS_KM = 25
export const INVITE_MAX = 50

export interface InviteCandidate extends Contact {
  interessi: string[]
  /** Geohash a 5 caratteri della zona (mai la posizione esatta). */
  zona: string
}

interface Input {
  event: EventLite
  candidates: InviteCandidate[]
  /** Chi non va invitato: organizzatore, già iscritti, bloccati in un senso o nell'altro. */
  excluded: ReadonlySet<string>
  radiusKm?: number
  max?: number
}

/**
 * Chi invitare a un evento nuovo: inviti accesi, telefono registrato, tra i suoi interessi c'è il tipo dell'evento,
 * zona entro il raggio. I più vicini per primi, al massimo `max`. Dei profili si leggono solo gli interessi
 * e il messaggio non contiene nessun dato di nessuno.
 */
export function inviteTargets({ event, candidates, excluded, radiusKm = INVITE_RADIUS_KM, max = INVITE_MAX }: Input): Contact[] {
  const found: { contact: Contact; km: number }[] = []
  for (const c of candidates) {
    if (excluded.has(c.uid) || c.uid === event.organizzatoreId) continue
    if (!wants(c, 'inviti') || !c.device.token) continue
    if (!c.interessi.includes(event.tipo)) continue
    const km = geohashDistanceKm(c.zona, event.geohash)
    if (km === null || km > radiusKm) continue
    found.push({ contact: { uid: c.uid, prefs: c.prefs, device: c.device }, km })
  }
  return found.sort((a, b) => a.km - b.km).slice(0, max).map((f) => f.contact)
}
