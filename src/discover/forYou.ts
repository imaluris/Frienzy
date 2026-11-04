import type { FrienzyEvent } from '../domain/event'
import type { EventTypeId } from '../domain/eventTypes'

/** Quanti interessi dell'utente corrispondono al tipo dell'evento (0 o 1: ogni evento ha un solo tipo). */
export function sharedInterests(event: FrienzyEvent, interessi: EventTypeId[]): number {
  return interessi.includes(event.tipo) ? 1 : 0
}

/**
 * Eventi "Per te": solo quelli del tipo che mi interessa, non miei, ordinati per vicinanza nel tempo.
 * Con più tipi di interesse, a parità di data conta l'ordine con cui ho scelto gli interessi (il primo vale di più).
 * Funzione pura: non modifica gli array ricevuti.
 */
export function rankForYou(events: FrienzyEvent[], interessi: EventTypeId[], uid: string): FrienzyEvent[] {
  const rank = (event: FrienzyEvent) => interessi.indexOf(event.tipo)
  return events
    .filter((event) => event.organizzatoreId !== uid && sharedInterests(event, interessi) > 0)
    .sort((a, b) => rank(a) - rank(b) || a.dataOra.getTime() - b.dataOra.getTime())
}
