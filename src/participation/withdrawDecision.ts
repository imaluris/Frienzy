import type { Participation } from '../domain/participation'

export type WithdrawDecision = { ok: true; liberaPosto: boolean } | { ok: false; motivo: string }

/**
 * Il ritiro dall'evento: ognuno ritira SOLO la propria partecipazione (il repository
 * riceve l'uid di chi si ritira). Se era confermata, libera un posto: il contatore scende di 1.
 * Funzione pura, condivisa da memoria e Firestore (come decideJoin).
 */
export function decideWithdraw(participation: Participation | null): WithdrawDecision {
  if (!participation) return { ok: false, motivo: 'Iscrizione non trovata' }
  return { ok: true, liberaPosto: participation.stato === 'confermato' }
}
