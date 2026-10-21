import type { FrienzyEvent } from '../domain/event'

export type CancelDecision = { ok: true } | { ok: false; motivo: string }

/** Chi può annullare un evento: solo l'organizzatore, e una volta sola. Funzione pura. */
export function decideCancel(event: FrienzyEvent | null, actorUid: string): CancelDecision {
  if (!event) return { ok: false, motivo: 'Evento non trovato' }
  if (event.organizzatoreId !== actorUid) return { ok: false, motivo: "Solo l'organizzatore può annullare" }
  if (event.stato === 'annullato') return { ok: false, motivo: 'Evento già annullato' }
  return { ok: true }
}
