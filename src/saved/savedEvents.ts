import type { FrienzyEvent } from '../domain/event'

/**
 * Dagli id salvati agli eventi, nell'ordine di salvataggio (l'ultimo salvato per primo).
 * Gli id di eventi che non ci sono più (o non sono più in programma) vengono saltati. Funzione pura.
 */
export function savedEvents(events: FrienzyEvent[], ids: string[]): FrienzyEvent[] {
  const byId = new Map(events.map((e) => [e.id, e]))
  return ids.map((id) => byId.get(id)).filter((e): e is FrienzyEvent => e !== undefined)
}
