import { inviteTargets, type InviteCandidate } from './invites'
import { inviteMessage, requestMessage, answerMessage, type Message } from './messages'
import { wants } from './recipients'
import type { BlockLite, Contact, EventLite, PartLite, PrefName } from './types'

const HOUR = 3_600_000
/** Un evento "nuovo" per gli inviti: creato nelle ultime 24 ore. */
export const NEW_EVENT_HOURS = 24

/** Un invio pianificato: la chiave serve a non mandarlo due volte. */
export interface Send {
  key: string
  pref: PrefName
  recipients: Contact[]
  message: Message
}

export interface PlanInput {
  now: Date
  /** Eventi futuri (qualunque stato: quelli non aperti si scartano qui). */
  events: EventLite[]
  /** Iscrizioni per id evento (basta per gli eventi che servono: con approvazione o nuovi). */
  participants: Record<string, PartLite[]>
  /** Nome di chi ha chiesto di partecipare (uid → nome), per il testo dell'avviso all'organizzatore. */
  names: Record<string, string>
  /** Preferenze e dispositivo di chi può ricevere avvisi su richieste e risposte (uid → contatto). */
  contacts: Record<string, Contact>
  /** Chi può essere invitato a eventi nuovi. */
  candidates: InviteCandidate[]
  blocks: BlockLite[]
  /** Chiavi già inviate. */
  sent: ReadonlySet<string>
}

const live = (e: EventLite, now: Date) => e.stato === 'aperto' && e.dataOra.getTime() > now.getTime()

function canReceive(contact: Contact | undefined, pref: PrefName): contact is Contact {
  return !!contact && !!contact.device.token && wants(contact, pref)
}

function requestSends({ now, events, participants, names, contacts, sent }: PlanInput): Send[] {
  const out: Send[] = []
  for (const e of events.filter((x) => x.richiedeApprovazione && live(x, now))) {
    const organizer = contacts[e.organizzatoreId]
    for (const p of participants[e.id] ?? []) {
      const key = `req:${e.id}:${p.uid}`
      if (p.stato !== 'richiesta' || sent.has(key) || !canReceive(organizer, 'richieste')) continue
      out.push({ key, pref: 'richieste', recipients: [organizer], message: requestMessage(e, names[p.uid] ?? 'Qualcuno') })
    }
  }
  return out
}

// Risposta solo per eventi con approvazione: con evento libero ci si iscrive da soli e non c'è nulla da comunicare.
function answerSends({ now, events, participants, contacts, sent }: PlanInput): Send[] {
  const out: Send[] = []
  for (const e of events.filter((x) => x.richiedeApprovazione && live(x, now))) {
    for (const p of participants[e.id] ?? []) {
      if (p.stato !== 'confermato' && p.stato !== 'rifiutato') continue
      const key = `ans:${e.id}:${p.uid}:${p.stato}`
      const contact = contacts[p.uid]
      if (sent.has(key) || !canReceive(contact, 'risposte')) continue
      out.push({ key, pref: 'risposte', recipients: [contact], message: answerMessage(e, p.stato) })
    }
  }
  return out
}

function blockedWith(uid: string, blocks: BlockLite[]): string[] {
  return blocks.flatMap((b) => (b.blockerId === uid ? [b.blockedId] : b.blockedId === uid ? [b.blockerId] : []))
}

function inviteSends({ now, events, participants, candidates, blocks, sent }: PlanInput): Send[] {
  const out: Send[] = []
  const since = now.getTime() - NEW_EVENT_HOURS * HOUR
  for (const e of events.filter((x) => live(x, now) && x.creatoIl.getTime() >= since)) {
    // Non si invita l'organizzatore, chi è già iscritto (in qualunque stato) né chi è bloccato in un senso o nell'altro.
    const excluded = new Set([e.organizzatoreId, ...(participants[e.id] ?? []).map((p) => p.uid), ...blockedWith(e.organizzatoreId, blocks)])
    for (const target of inviteTargets({ event: e, candidates, excluded })) {
      const key = `inv:${e.id}:${target.uid}`
      if (!sent.has(key)) out.push({ key, pref: 'inviti', recipients: [target], message: inviteMessage(e) })
    }
  }
  return out
}

/**
 * Cosa mandare adesso, dato lo stato dei dati: richieste all'organizzatore, risposte a chi aveva chiesto, inviti agli eventi nuovi.
 * Funzione pura: niente rete, niente orologio (l'ora arriva da fuori). Nessun doppione: ogni chiave compare una volta sola
 * e mai se è già tra quelle inviate.
 */
export function plan(input: PlanInput): Send[] {
  const all = [...requestSends(input), ...answerSends(input), ...inviteSends(input)]
  const seen = new Set<string>()
  return all.filter((s) => (seen.has(s.key) ? false : (seen.add(s.key), true))).sort((a, b) => a.key.localeCompare(b.key))
}
