import type { FrienzyEvent } from '../domain/event'
import type { Participation, ParticipationStatus } from '../domain/participation'

/**
 * La lista d'attesa: funzioni pure, condivise da memoria e Firestore (come decideJoin).
 * L'ordine è quello di arrivo (creatoIl); a parità di istante decide l'uid, così l'ordine è sempre lo stesso.
 */
export function waitlistOrder(all: Participation[]): Participation[] {
  return all
    .filter((p) => p.stato === 'inAttesa')
    .sort((a, b) => a.creatoIl.getTime() - b.creatoIl.getTime() || a.uid.localeCompare(b.uid))
}

/** Posizione in lista (1 = il prossimo), oppure null se non si è in lista. */
export function waitlistPosition(all: Participation[], uid: string): number | null {
  const index = waitlistOrder(all).findIndex((p) => p.uid === uid)
  return index === -1 ? null : index + 1
}

export interface Promotion {
  uid: string
  /** Libero → confermato; con approvazione → richiesta (decide poi l'organizzatore). */
  stato: ParticipationStatus
}

/** Chi sale quando si libera un posto: il primo in lista, o nessuno se la lista è vuota o l'evento non è aperto. */
export function pickPromotion(event: FrienzyEvent | null, all: Participation[]): Promotion | null {
  if (!event || event.stato !== 'aperto') return null
  const first = waitlistOrder(all)[0]
  if (!first) return null
  return { uid: first.uid, stato: event.richiedeApprovazione ? 'richiesta' : 'confermato' }
}

interface WaitlistContext {
  event: FrienzyEvent | null
  uid: string
  existing: Participation | null
  confermati: number
  blocked?: boolean
}

export type WaitlistDecision = { ok: true } | { ok: false; motivo: string }

/** Ci si mette in lista solo se l'evento è aperto, pieno, e non si è già iscritti. */
export function decideWaitlist({ event, uid, existing, confermati, blocked = false }: WaitlistContext): WaitlistDecision {
  if (!event) return { ok: false, motivo: 'Evento non trovato' }
  if (event.stato !== 'aperto') return { ok: false, motivo: 'Evento non aperto alle iscrizioni' }
  if (event.organizzatoreId === uid) return { ok: false, motivo: "Sei l'organizzatore di questo evento" }
  if (blocked) return { ok: false, motivo: 'Non puoi partecipare a questo evento' }
  if (existing) return { ok: false, motivo: 'Già iscritto a questo evento' }
  if (confermati < event.maxPartecipanti) return { ok: false, motivo: 'Ci sono ancora posti: puoi partecipare' }
  return { ok: true }
}
