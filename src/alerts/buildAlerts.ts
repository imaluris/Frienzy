import type { FrienzyEvent } from '../domain/event'
import { EVENT_TYPE_EMOJI, type EventTypeId } from '../domain/eventTypes'
import type { Participation } from '../domain/participation'
import { friendlyWhen } from '../events/dayBadge'
import type { LatLng } from '../events/geohashDecode'
import { distanceToGeohashKm } from '../filters/distance'
import type { NotificationPrefs } from '../notifications/prefs'
import type { AppAlert } from './alertTypes'

export const INVITE_DAYS = 7
export const INVITE_RADIUS_KM = 25
const DAY = 86_400_000

export interface AlertsInput {
  uid: string
  interessi: readonly EventTypeId[]
  prefs: NotificationPrefs
  now: Date
  /** Eventi già senza quelli di persone bloccate. */
  events: readonly FrienzyEvent[]
  myParticipations: readonly Participation[]
  /** Richieste in attesa per ciascun evento che organizzo (id evento → numero). */
  pendingCounts: Readonly<Record<string, number>>
  /** Dove sono (o il centro della mia zona); null se non si sa: allora non si controlla la distanza. */
  position: LatLng | null
}

const isLive = (event: FrienzyEvent, now: Date) => event.stato === 'aperto' && event.dataOra.getTime() > now.getTime()

function pendingAlerts({ uid, events, pendingCounts, now }: AlertsInput): AppAlert[] {
  return events
    .filter((e) => e.organizzatoreId === uid && isLive(e, now) && (pendingCounts[e.id] ?? 0) > 0)
    .map((e) => {
      const n = pendingCounts[e.id]
      // La chiave contiene il numero: se arriva un'altra richiesta, l'avviso torna "nuovo".
      return { key: `req:${e.id}:${n}`, kind: 'richieste' as const, eventId: e.id, at: now,
        title: n === 1 ? '1 richiesta in attesa' : `${n} richieste in attesa`, body: `Per "${e.titolo}". Rispondi dal pannello organizzatore.` }
    })
}

function answerAlerts({ uid, events, myParticipations, now }: AlertsInput): AppAlert[] {
  const byId = new Map(events.map((e) => [e.id, e]))
  const out: AppAlert[] = []
  for (const p of myParticipations) {
    const e = byId.get(p.eventId)
    // Con evento libero ci si iscrive da soli: la "risposta" esiste solo quando serve l'approvazione.
    if (!e || e.organizzatoreId === uid || !e.richiedeApprovazione || !isLive(e, now)) continue
    if (p.stato !== 'confermato' && p.stato !== 'rifiutato') continue
    const yes = p.stato === 'confermato'
    out.push({ key: `ans:${e.id}:${p.stato}`, kind: 'risposte', eventId: e.id, at: p.creatoIl,
      title: yes ? 'Richiesta accettata' : 'Richiesta non accettata',
      body: yes ? `Sei dentro a "${e.titolo}" (${friendlyWhen(e.dataOra, now)}).` : `Stavolta "${e.titolo}" non è andata. Ci sono tanti altri eventi!` })
  }
  return out
}

function inviteAlerts({ uid, interessi, events, myParticipations, position, now }: AlertsInput): AppAlert[] {
  const joined = new Set(myParticipations.map((p) => p.eventId))
  const since = now.getTime() - INVITE_DAYS * DAY
  return events
    .filter((e) => e.organizzatoreId !== uid && isLive(e, now) && !joined.has(e.id))
    .filter((e) => e.creatoIl.getTime() >= since && interessi.includes(e.tipo))
    .filter((e) => {
      if (!position) return true
      const km = distanceToGeohashKm(position, e.geohash)
      return km === null || km <= INVITE_RADIUS_KM
    })
    .map((e) => ({ key: `inv:${e.id}`, kind: 'inviti' as const, eventId: e.id, at: e.creatoIl,
      title: `Un evento per te: ${e.titolo}`, body: `${EVENT_TYPE_EMOJI[e.tipo]} ${e.zonaNome} · ${friendlyWhen(e.dataOra, now)}` }))
}

/**
 * Tutti gli avvisi di adesso, dal più recente: richieste in attesa sui miei eventi, risposte alle mie richieste,
 * inviti a eventi nuovi (ultimi 7 giorni) nei miei interessi. Rispetta gli interruttori delle notifiche. Funzione pura.
 */
export function buildAlerts(input: AlertsInput): AppAlert[] {
  const all = [...pendingAlerts(input), ...answerAlerts(input), ...inviteAlerts(input)]
  return all.filter((a) => input.prefs[a.kind]).sort((a, b) => b.at.getTime() - a.at.getTime())
}
