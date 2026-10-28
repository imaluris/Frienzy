import type { FrienzyEvent } from '../domain/event'
import { EVENT_TYPE_EMOJI } from '../domain/eventTypes'
import { formatShortDate } from '../events/format'

/** Un segnaposto pronto da disegnare sulla mappa. Usa solo la posizione APPROSSIMATA. */
export interface EventMarker {
  eventId: string
  lat: number
  lng: number
  emoji: string
  title: string
  when: string // data breve, per il popup
  zone: string // zona approssimata, per il popup
}

/** Trasforma gli eventi in marker con l'emoji del loro tipo. Funzione pura. */
export function eventsToMarkers(events: FrienzyEvent[]): EventMarker[] {
  return events.map((event) => ({
    eventId: event.id,
    lat: event.latApprossimata,
    lng: event.lngApprossimata,
    emoji: EVENT_TYPE_EMOJI[event.tipo],
    title: event.titolo,
    when: formatShortDate(event.dataOra),
    zone: event.zonaNome,
  }))
}
