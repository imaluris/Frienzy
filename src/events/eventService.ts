import type { EventRepository } from '../data/eventRepository'
import type { ExactPlace, FrienzyEvent, NewEvent } from '../domain/event'
import type { EventTypeId } from '../domain/eventTypes'
import { approximateCoordinate } from './approximate'
import { encodeGeohash } from './geohash'
import { parseDateTime, parseNumber, validateEvent, type EventInput } from './validation'

/** Dal form ai due oggetti da salvare: evento pubblico (zona approssimata) e luogo esatto (riservato). */
export function buildEvent(uid: string, input: EventInput): { event: NewEvent; place: ExactPlace } {
  const lat = parseNumber(input.lat) as number // già verificati da validateEvent
  const lng = parseNumber(input.lng) as number
  const latApprossimata = approximateCoordinate(lat)
  const lngApprossimata = approximateCoordinate(lng)
  const event: NewEvent = {
    organizzatoreId: uid,
    tipo: input.tipo as EventTypeId,
    titolo: input.titolo.trim(),
    descrizione: input.descrizione.trim(),
    dataOra: parseDateTime(input.dataOra) as Date,
    zonaNome: input.zonaNome.trim(),
    latApprossimata,
    lngApprossimata,
    // Il geohash parte dal punto approssimato, così non rivela la posizione esatta.
    geohash: encodeGeohash(latApprossimata, lngApprossimata),
    maxPartecipanti: parseNumber(input.maxPartecipanti) as number,
    richiedeApprovazione: input.richiedeApprovazione,
  }
  return { event, place: { indirizzo: input.indirizzo.trim(), lat, lng } }
}

/** Convalida e crea l'evento. Lancia un Error con il messaggio da mostrare se i dati non vanno bene. */
export async function createEvent(
  events: EventRepository,
  uid: string,
  input: EventInput,
  now: Date = new Date(),
): Promise<FrienzyEvent> {
  const problem = validateEvent(input, now)
  if (problem) throw new Error(problem)
  const { event, place } = buildEvent(uid, input)
  return events.create(event, place)
}
