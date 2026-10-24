import type { FrienzyEvent } from '../domain/event'
import type { Participation } from '../domain/participation'

/** Cosa mostrare, nel dettaglio, a chi guarda l'evento. */
export type ParticipationView =
  | 'organizzatore'
  | 'annullato'
  | 'chiuso'
  | 'confermato'
  | 'richiesta'
  | 'rifiutato'
  | 'pieno'
  | 'partecipa'
  | 'chiedi'

interface ViewContext {
  event: FrienzyEvent
  uid: string
  /** La partecipazione di chi guarda, se esiste. */
  mine: Participation | null
  /** Posti già occupati (partecipazioni 'confermato'). */
  confirmedCount: number
}

/**
 * Sceglie lo stato da mostrare. Funzione pura: le regole vere (posti, permessi) restano
 * in decideJoin e nelle transazioni; qui si decide solo quali pulsanti far vedere.
 */
export function decideView({ event, uid, mine, confirmedCount }: ViewContext): ParticipationView {
  if (event.organizzatoreId === uid) return 'organizzatore'
  if (mine) return mine.stato // 'confermato' | 'richiesta' | 'rifiutato'
  if (event.stato === 'annullato') return 'annullato'
  if (event.stato !== 'aperto') return 'chiuso'
  if (event.richiedeApprovazione) return 'chiedi'
  return confirmedCount >= event.maxPartecipanti ? 'pieno' : 'partecipa'
}
