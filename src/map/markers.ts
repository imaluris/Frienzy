import type { FrienzyEvent } from '../domain/event'
import { EVENT_TYPE_EMOJI } from '../domain/eventTypes'
import { formatShortDate } from '../events/format'
import { TYPE_COLOR } from './typeColors'

/** Un segnaposto pronto da disegnare sulla mappa. Usa solo la posizione APPROSSIMATA. */
export interface EventMarker {
  eventId: string
  lat: number
  lng: number
  emoji: string
  color: string // colore del tipo di evento
  title: string
  when: string // data breve
  zone: string // zona approssimata
}

/** Trasforma gli eventi in marker con l'emoji del loro tipo. Funzione pura. */
export function eventsToMarkers(events: FrienzyEvent[]): EventMarker[] {
  return events.map((event) => ({
    eventId: event.id,
    lat: event.latApprossimata,
    lng: event.lngApprossimata,
    emoji: EVENT_TYPE_EMOJI[event.tipo],
    color: TYPE_COLOR[event.tipo],
    title: event.titolo,
    when: formatShortDate(event.dataOra),
    zone: event.zonaNome,
  }))
}
