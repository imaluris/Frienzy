import type { FrienzyEvent } from '../domain/event'
import type { Participation, ParticipationStatus } from '../domain/participation'

export type ResponseAction = 'accetta' | 'rifiuta'

export type ResponseDecision = { ok: true; stato: ParticipationStatus } | { ok: false; motivo: string }

interface ResponseContext {
  event: FrienzyEvent | null
  /** Chi sta cercando di decidere. */
  actorUid: string
  participation: Participation | null
  /** Posti già occupati (partecipazioni 'confermato'). */
  confermati: number
  azione: ResponseAction
}

/**
 * Chi può accettare o rifiutare una richiesta, e con quale esito.
 * Funzione pura, condivisa da memoria e Firestore (come decideJoin).
 */
export function decideResponse({ event, actorUid, participation, confermati, azione }: ResponseContext): ResponseDecision {
  if (!event) return { ok: false, motivo: 'Evento non trovato' }
  if (event.organizzatoreId !== actorUid) return { ok: false, motivo: "Solo l'organizzatore può decidere" }
  if (!participation) return { ok: false, motivo: 'Richiesta non trovata' }
  if (participation.stato !== 'richiesta') return { ok: false, motivo: 'Richiesta già decisa' }
  if (azione === 'rifiuta') return { ok: true, stato: 'rifiutato' }
  if (event.stato !== 'aperto') return { ok: false, motivo: 'Evento non aperto alle iscrizioni' }
  // Il posto si occupa solo ora, quando la richiesta viene accettata.
  if (confermati >= event.maxPartecipanti) return { ok: false, motivo: 'Posti esauriti' }
  return { ok: true, stato: 'confermato' }
}
