import type { FrienzyEvent } from '../domain/event'

// Funzioni pure del blocco. Il blocco vale nei due sensi: chi ha bloccato e chi è stato bloccato
// non si vedono più (eventi e persone), e chi è bloccato non può chiedere di partecipare.

/** Tutte le persone da nascondere a `uid`: quelle che ha bloccato e quelle che hanno bloccato lui. */
export function hiddenUids(blockedByMe: readonly string[], blockedMe: readonly string[]): Set<string> {
  return new Set([...blockedByMe, ...blockedMe])
}

/** Toglie dall'elenco gli eventi organizzati da persone nascoste. Non modifica l'array ricevuto. */
export function withoutBlockedEvents<T extends Pick<FrienzyEvent, 'organizzatoreId'>>(events: readonly T[], hidden: ReadonlySet<string>): T[] {
  if (hidden.size === 0) return [...events]
  return events.filter((event) => !hidden.has(event.organizzatoreId))
}

/** Toglie dall'elenco delle persone quelle nascoste. */
export function withoutBlockedPeople<T extends { uid: string }>(people: readonly T[], hidden: ReadonlySet<string>): T[] {
  if (hidden.size === 0) return [...people]
  return people.filter((person) => !hidden.has(person.uid))
}
