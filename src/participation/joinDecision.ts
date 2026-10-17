import type { FrienzyEvent } from '../domain/event'
import type { Participation, ParticipationStatus } from '../domain/participation'

export type JoinDecision = { ok: true; stato: ParticipationStatus } | { ok: false; motivo: string }

interface JoinContext {
  event: FrienzyEvent | null
  uid: string
  existing: Participation | null
  /** Quanti posti sono già occupati (partecipazioni 'confermato'). */
  confermati: number
}

/**
 * La regola unica dell'iscrizione. La usano sia il repository in memoria sia la
 * transazione Firebase, così i due non possono dire cose diverse.
 * Funzione pura: nessun accesso ai dati, solo una decisione.
 */
export function decideJoin({ event, uid, existing, confermati }: JoinContext): JoinDecision {
  if (!event) return { ok: false, motivo: 'Evento non trovato' }
  if (event.stato !== 'aperto') return { ok: false, motivo: 'Evento non aperto alle iscrizioni' }
  if (event.organizzatoreId === uid) return { ok: false, motivo: "Sei l'organizzatore di questo evento" }
  if (existing) return { ok: false, motivo: 'Già iscritto a questo evento' }
  // Con approvazione nasce 'richiesta' e non occupa posti finché non viene accettata.
  if (event.richiedeApprovazione) return { ok: true, stato: 'richiesta' }
  if (confermati >= event.maxPartecipanti) return { ok: false, motivo: 'Posti esauriti' }
  return { ok: true, stato: 'confermato' }
}
