import type { FrienzyEvent } from '../domain/event'
import type { Participation } from '../domain/participation'

/**
 * Chi può leggere il luogo esatto: l'organizzatore e chi è CONFERMATO.
 * Richiesta, rifiutato, sconosciuto o non collegato (viewerUid null): no.
 * È la stessa regola di firestore.rules (isOrganizer || isConfirmed).
 */
export function canSeeExactPlace(
  event: FrienzyEvent,
  viewerUid: string | null,
  participation: Participation | null,
): boolean {
  if (!viewerUid) return false
  if (event.organizzatoreId === viewerUid) return true
  return participation?.uid === viewerUid && participation.stato === 'confermato'
}
