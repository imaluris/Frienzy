import type { Firestore } from 'firebase-admin/firestore'
import { readBlocksOf } from './io/readBlocks'
import { readParticipants, readUpcomingEvents } from './io/readEvents'
import { readDevices, readPrefs, readProfiles } from './io/readPeople'
import type { InviteCandidate } from './logic/invites'
import { NEW_EVENT_HOURS, type PlanInput } from './logic/plan'
import type { Contact, EventLite, PartLite } from './logic/types'

const unique = (list: string[]) => [...new Set(list)]

/**
 * Legge da Firestore SOLO ciò che serve a decidere (letture gratuite contate): eventi futuri; iscrizioni degli eventi
 * con approvazione o nuovi; dispositivi; preferenze e profili delle sole persone coinvolte; blocchi se ci sono inviti da fare.
 */
export async function gather(db: Firestore, now: Date, sent: ReadonlySet<string>): Promise<PlanInput> {
  const events = (await readUpcomingEvents(db, now)).filter((e) => e.stato === 'aperto')
  const since = now.getTime() - NEW_EVENT_HOURS * 3_600_000
  const fresh = events.filter((e) => e.creatoIl.getTime() >= since)
  const relevant = events.filter((e) => e.richiedeApprovazione || fresh.includes(e))
  const empty: PlanInput = { now, events, participants: {}, names: {}, contacts: {}, candidates: [], blocks: [], sent }
  if (relevant.length === 0) return empty

  const lists = await Promise.all(relevant.map((e) => readParticipants(db, e.id)))
  const participants: Record<string, PartLite[]> = Object.fromEntries(relevant.map((e, i) => [e.id, lists[i]]))
  const devices = await readDevices(db)

  // Chi può ricevere avvisi su richieste (organizzatori con richieste in coda) e risposte (chi è stato accettato o rifiutato).
  const asked = (e: EventLite) => (participants[e.id] ?? []).filter((p) => p.stato === 'richiesta')
  const answered = (e: EventLite) => (participants[e.id] ?? []).filter((p) => p.stato === 'confermato' || p.stato === 'rifiutato')
  const approval = relevant.filter((e) => e.richiedeApprovazione)
  const involved = unique([...approval.filter((e) => asked(e).length > 0).map((e) => e.organizzatoreId), ...approval.flatMap((e) => answered(e).map((p) => p.uid))])
    .filter((uid) => devices[uid]?.token)
  const candidateUids = fresh.length > 0 ? Object.keys(devices).filter((uid) => devices[uid].token && devices[uid].zona) : []

  const everyone = unique([...involved, ...candidateUids])
  const [prefs, profiles, blocks] = await Promise.all([
    readPrefs(db, everyone),
    readProfiles(db, unique([...approval.flatMap((e) => asked(e).map((p) => p.uid)), ...candidateUids])),
    fresh.length > 0 ? readBlocksOf(db, unique(fresh.map((e) => e.organizzatoreId))) : Promise.resolve([]),
  ])
  const contact = (uid: string): Contact => ({ uid, prefs: prefs[uid] ?? {}, device: devices[uid] })
  const contacts = Object.fromEntries(involved.map((uid) => [uid, contact(uid)]))
  const candidates: InviteCandidate[] = candidateUids.map((uid) => ({ ...contact(uid), interessi: profiles[uid]?.interessi ?? [], zona: devices[uid].zona ?? '' }))
  const names = Object.fromEntries(Object.entries(profiles).map(([uid, p]) => [uid, p.nome]))
  return { ...empty, participants, names, contacts, candidates, blocks }
}
