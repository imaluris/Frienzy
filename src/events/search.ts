import type { FrienzyEvent } from '../domain/event'

// Toglie accenti e maiuscole: "Perù" e "peru" si trovano a vicenda.
function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('it-IT')
}

/** Eventi il cui titolo o la cui zona contengono tutte le parole cercate. Ricerca vuota = tutti. */
export function searchEvents(events: FrienzyEvent[], query: string): FrienzyEvent[] {
  const words = normalize(query).split(/\s+/).filter(Boolean)
  if (words.length === 0) return events
  return events.filter((event) => {
    const haystack = normalize(`${event.titolo} ${event.zonaNome}`)
    return words.every((word) => haystack.includes(word))
  })
}
