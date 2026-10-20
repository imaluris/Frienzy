import type { FrienzyEvent } from '../domain/event'
import type { EventTypeId } from '../domain/eventTypes'
import type { LatLng } from '../events/geohashDecode'
import { distanceToGeohashKm } from './distance'

export interface EventFilters {
  /** Vuoto = tutti i tipi. */
  tipi: EventTypeId[]
  /** Dal giorno `da` (incluso, dalle 00:00 UTC). */
  da: Date | null
  /** Fino al giorno `a` (incluso, fino a fine giornata UTC). */
  a: Date | null
  /** Centro e raggio vanno insieme: se manca uno dei due, il filtro distanza è spento. */
  centro: LatLng | null
  raggioKm: number | null
}

export const NO_FILTERS: EventFilters = { tipi: [], da: null, a: null, centro: null, raggioKm: null }

const DAY_MS = 24 * 3600 * 1000

export function matchesType(event: FrienzyEvent, tipi: EventTypeId[]): boolean {
  return tipi.length === 0 || tipi.includes(event.tipo)
}

export function matchesDates(event: FrienzyEvent, da: Date | null, a: Date | null): boolean {
  const time = event.dataOra.getTime()
  if (da && time < da.getTime()) return false
  // "Fino al giorno a incluso": il limite è l'inizio del giorno dopo.
  if (a && time >= a.getTime() + DAY_MS) return false
  return true
}

/** Dentro il raggio, misurato dal centro del geohash dell'evento. Geohash illeggibile: escluso. */
export function matchesDistance(event: FrienzyEvent, centro: LatLng | null, raggioKm: number | null): boolean {
  if (!centro || raggioKm === null) return true
  const km = distanceToGeohashKm(centro, event.geohash)
  return km !== null && km <= raggioKm
}

/** Applica tutti i filtri insieme (E logico). Non modifica l'array e ne mantiene l'ordine. */
export function filterEvents(events: FrienzyEvent[], f: EventFilters): FrienzyEvent[] {
  return events.filter(
    (e) => matchesType(e, f.tipi) && matchesDates(e, f.da, f.a) && matchesDistance(e, f.centro, f.raggioKm),
  )
}
