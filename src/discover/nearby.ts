import type { FrienzyEvent } from '../domain/event'
import type { LatLng } from '../events/geohashDecode'
import { distanceToGeohashKm } from '../filters/distance'

export interface NearbyEvent {
  event: FrienzyEvent
  km: number
}

export const NEARBY_RADIUS_KM = 25

/** Eventi entro il raggio, dal più vicino. Geohash illeggibile: escluso. Senza posizione: lista vuota. */
export function nearbyEvents(events: FrienzyEvent[], point: LatLng | null, radiusKm = NEARBY_RADIUS_KM): NearbyEvent[] {
  if (!point) return []
  const found: NearbyEvent[] = []
  for (const event of events) {
    const km = distanceToGeohashKm(point, event.geohash)
    if (km !== null && km <= radiusKm) found.push({ event, km })
  }
  return found.sort((a, b) => a.km - b.km || a.event.dataOra.getTime() - b.event.dataOra.getTime())
}

/** "800 m" sotto il chilometro, "3,4 km" fino a 10, poi "12 km". */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.max(100, Math.round((km * 1000) / 100) * 100)} m`
  if (km < 10) return `${km.toFixed(1).replace('.', ',')} km`
  return `${Math.round(km)} km`
}
