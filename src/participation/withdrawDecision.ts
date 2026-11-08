import type { FrienzyEvent } from '../domain/event'
import type { Participation } from '../domain/participation'
import { pickPromotion, type Promotion } from './waitlist'

export type WithdrawDecision =
  | { ok: true; liberaPosto: boolean; promuovi: Promotion | null }
  | { ok: false; motivo: string }

interface WithdrawContext {
  participation: Participation | null
  event?: FrienzyEvent | null
  /** Tutte le iscrizioni dell'evento (serve a trovare il primo della lista d'attesa). */
  all?: Participation[]
}

/**
 * Il ritiro dall'evento: ognuno ritira SOLO la propria partecipazione (il repository
 * riceve l'uid di chi si ritira). Se era confermata, libera un posto e, se c'è una lista d'attesa,
 * il primo sale nello stesso momento (`promuovi`). Chi esce dalla lista non libera nulla.
 * Funzione pura, condivisa da memoria e Firestore (come decideJoin).
 */
export function decideWithdraw({ participation, event = null, all = [] }: WithdrawContext): WithdrawDecision {
  if (!participation) return { ok: false, motivo: 'Iscrizione non trovata' }
  const liberaPosto = participation.stato === 'confermato'
  return { ok: true, liberaPosto, promuovi: liberaPosto ? pickPromotion(event, all) : null }
}
